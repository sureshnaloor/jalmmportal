import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiFileText, FiDownload, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import moment from 'moment';

const POLL_INTERVAL_MS = 4000;

function storageKey(projectId, openOnly) {
  return `delayedPoReportJobId:${projectId}:${openOnly ? 'open' : 'all'}`;
}

function scopeQuery(projectId, openOnly) {
  return `projectId=${encodeURIComponent(projectId)}&openOnly=${openOnly ? 'true' : 'false'}`;
}

function applyJobStatus(data, setters) {
  const { setJobId, setState, setProgress, setCompletedAt } = setters;
  if (data.progress) setProgress(data.progress);
  if (data.completedAt) setCompletedAt(data.completedAt);
  if (data.jobId) setJobId(data.jobId);

  if (data.status === 'completed') {
    setState('ready');
    if (data.completedAt) setCompletedAt(data.completedAt);
  } else if (data.status === 'pending' || data.status === 'running') {
    setState('running');
  }
}

export default function ProjectPOReportActions({
  projectId,
  projectName,
  layout = 'compact',
  showOpenOnlySwitch = false,
  defaultOpenOnly = true,
}) {
  const [openOnly, setOpenOnly] = useState(defaultOpenOnly);
  const [state, setState] = useState('idle');
  const [jobId, setJobId] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [progress, setProgress] = useState({ processedPOs: 0, totalPOs: 0 });
  const pollRef = useRef(null);

  const setters = { setJobId, setState, setProgress, setCompletedAt };
  const isToolbar = layout === 'toolbar';

  const clearPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    clearPolling();
    setState('idle');
    setJobId(null);
    setCompletedAt(null);
    setDownloadingFormat(null);
    setProgress({ processedPOs: 0, totalPOs: 0 });
    sessionStorage.removeItem(storageKey(projectId, openOnly));
  }, [clearPolling, projectId, openOnly]);

  const pollStatus = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/reports/delayed-po-reasons/status/${id}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'completed') {
        clearPolling();
        applyJobStatus(data, setters);
        sessionStorage.setItem(storageKey(projectId, openOnly), id);
      } else if (data.status === 'failed') {
        clearPolling();
        toast.error(data.error || 'Report generation failed');
        const latestRes = await fetch(
          `/api/reports/delayed-po-reasons/status/latest?${scopeQuery(projectId, openOnly)}`
        );
        if (latestRes.ok) {
          const latest = await latestRes.json();
          if (latest.status === 'completed' && latest.jobId) {
            applyJobStatus(latest, setters);
            sessionStorage.setItem(storageKey(projectId, openOnly), latest.jobId);
            return;
          }
        }
        resetToIdle();
      } else {
        applyJobStatus(data, setters);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, [clearPolling, projectId, openOnly, resetToIdle]);

  const startPolling = useCallback((id) => {
    clearPolling();
    pollStatus(id);
    pollRef.current = setInterval(() => pollStatus(id), POLL_INTERVAL_MS);
  }, [clearPolling, pollStatus]);

  const loadLatestStatus = useCallback(async () => {
    const storedJobId = sessionStorage.getItem(storageKey(projectId, openOnly));
    if (storedJobId) {
      const res = await fetch(`/api/reports/delayed-po-reasons/status/${storedJobId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'completed') {
          applyJobStatus(data, setters);
          return true;
        }
        if (data.status === 'pending' || data.status === 'running') {
          applyJobStatus(data, setters);
          startPolling(storedJobId);
          return true;
        }
      }
    }

    const latestRes = await fetch(
      `/api/reports/delayed-po-reasons/status/latest?${scopeQuery(projectId, openOnly)}`
    );
    if (latestRes.ok) {
      const data = await latestRes.json();
      if (data.status === 'completed' && data.jobId) {
        applyJobStatus(data, setters);
        sessionStorage.setItem(storageKey(projectId, openOnly), data.jobId);
        return true;
      }
      if ((data.status === 'pending' || data.status === 'running') && data.jobId) {
        applyJobStatus(data, setters);
        sessionStorage.setItem(storageKey(projectId, openOnly), data.jobId);
        startPolling(data.jobId);
        return true;
      }
    }
    resetToIdle();
    return false;
  }, [projectId, openOnly, resetToIdle, startPolling]);

  useEffect(() => {
    if (!projectId) return undefined;
    loadLatestStatus().catch((err) => console.error('Init project PO report state error:', err));
    return () => clearPolling();
  }, [projectId, openOnly, clearPolling, loadLatestStatus]);

  const handleOpenOnlyToggle = () => {
    setOpenOnly((prev) => !prev);
  };

  const handleGenerate = async () => {
    try {
      setState('running');
      setDownloadingFormat(null);
      const res = await fetch('/api/reports/delayed-po-reasons/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, projectName, openOnly }),
      });
      const data = await res.json();

      if (!res.ok && res.status !== 202 && res.status !== 200) {
        throw new Error(data.error || 'Failed to start report');
      }

      const id = data.jobId;
      setJobId(id);
      sessionStorage.setItem(storageKey(projectId, openOnly), id);

      if (data.status === 'completed') {
        const statusRes = await fetch(`/api/reports/delayed-po-reasons/status/${id}`);
        if (statusRes.ok) {
          applyJobStatus(await statusRes.json(), setters);
        } else {
          setState('ready');
        }
        toast.success('Report generated');
        return;
      }

      startPolling(id);
      toast.info('Report generation started');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to start report');
      await loadLatestStatus();
    }
  };

  const handleDownload = async (format) => {
    if (!jobId || downloadingFormat) return;
    setDownloadingFormat(format);

    try {
      const res = await fetch(
        `/api/reports/delayed-po-reasons/download/${jobId}?format=${format}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Download failed');
      }

      const blob = await res.blob();
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const safeProject = String(projectId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const scopeSuffix = openOnly ? 'open' : 'all';
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Open_PO_Report_${safeProject}_${scopeSuffix}_${moment(completedAt || undefined).format('YYYY-MM-DD_HH-mm')}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${format === 'pdf' ? 'PDF' : 'Excel'} downloaded`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const btnBase = isToolbar
    ? 'inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
    : 'inline-flex items-center text-xs font-semibold py-1 px-2 rounded disabled:opacity-60 disabled:cursor-not-allowed';

  const switchControl = showOpenOnlySwitch ? (
    <label className={`inline-flex items-center gap-2 ${isToolbar ? 'text-sm' : 'text-xs'} text-gray-600 cursor-pointer select-none`}>
      <input
        type="checkbox"
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        checked={openOnly}
        onChange={handleOpenOnlyToggle}
      />
      Open POs only
    </label>
  ) : null;

  const reportDateLabel = completedAt
    ? moment(completedAt).format('MMM D, YYYY h:mm A')
    : null;

  const renderActions = () => {
    if (state === 'running') {
      const progressText =
        progress.totalPOs > 0 ? ` (${progress.processedPOs}/${progress.totalPOs} POs)` : '';
      return (
        <button type="button" disabled className={`${btnBase} bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed`}>
          <FiLoader className={`${isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} animate-spin`} />
          Generating{progressText}
        </button>
      );
    }

    if (state === 'idle') {
      return (
        <button
          type="button"
          onClick={handleGenerate}
          className={`${btnBase} text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          title="Generate open PO report for this project"
        >
          <FiFileText className={isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} />
          Generate
        </button>
      );
    }

    return (
      <>
        {reportDateLabel && (
          <span className={`${isToolbar ? 'text-xs' : 'text-[10px]'} text-gray-500 whitespace-nowrap`}>
            Report run on {reportDateLabel}
          </span>
        )}
        <button
          type="button"
          onClick={() => handleDownload('xlsx')}
          disabled={!!downloadingFormat}
          className={`${btnBase} text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {downloadingFormat === 'xlsx' ? (
            <FiLoader className={`${isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} animate-spin`} />
          ) : (
            <FiDownload className={isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} />
          )}
          Excel
        </button>
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          disabled={!!downloadingFormat}
          className={`${btnBase} text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
        >
          {downloadingFormat === 'pdf' ? (
            <FiLoader className={`${isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} animate-spin`} />
          ) : (
            <FiDownload className={isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} />
          )}
          PDF
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!!downloadingFormat}
          className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          title="Regenerate fresh data"
        >
          <FiRefreshCw className={isToolbar ? 'mr-2 h-4 w-4' : 'mr-1 h-3 w-3'} />
          Regenerate
        </button>
      </>
    );
  };

  if (isToolbar) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {switchControl}
        <div className="flex flex-wrap items-center gap-2">
          {renderActions()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-[220px]">
      {switchControl && <div className="mb-1">{switchControl}</div>}
      <div className="flex flex-wrap gap-1 items-center">
        {renderActions()}
      </div>
    </div>
  );
}
