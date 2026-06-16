import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiFileText, FiDownload, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import moment from 'moment';

const STORAGE_KEY = 'delayedPoReportJobId';
const POLL_INTERVAL_MS = 4000;

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

export default function DelayedPOReportButton() {
  const [state, setState] = useState('idle');
  const [jobId, setJobId] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [progress, setProgress] = useState({ processedPOs: 0, totalPOs: 0 });
  const pollRef = useRef(null);

  const setters = { setJobId, setState, setProgress, setCompletedAt };

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
    sessionStorage.removeItem(STORAGE_KEY);
  }, [clearPolling]);

  const pollStatus = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/reports/delayed-po-reasons/status/${id}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'completed') {
        clearPolling();
        applyJobStatus(data, setters);
        sessionStorage.setItem(STORAGE_KEY, id);
      } else if (data.status === 'failed') {
        clearPolling();
        toast.error(data.error || 'Report generation failed');
        const latestRes = await fetch('/api/reports/delayed-po-reasons/status/latest');
        if (latestRes.ok) {
          const latest = await latestRes.json();
          if (latest.status === 'completed' && latest.jobId) {
            applyJobStatus(latest, setters);
            sessionStorage.setItem(STORAGE_KEY, latest.jobId);
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
  }, [clearPolling, resetToIdle]);

  const startPolling = useCallback((id) => {
    clearPolling();
    pollStatus(id);
    pollRef.current = setInterval(() => pollStatus(id), POLL_INTERVAL_MS);
  }, [clearPolling, pollStatus]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedJobId = sessionStorage.getItem(STORAGE_KEY);
        if (storedJobId) {
          const res = await fetch(`/api/reports/delayed-po-reasons/status/${storedJobId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              applyJobStatus(data, setters);
              return;
            }
            if (data.status === 'pending' || data.status === 'running') {
              applyJobStatus(data, setters);
              startPolling(storedJobId);
              return;
            }
          }
        }

        const latestRes = await fetch('/api/reports/delayed-po-reasons/status/latest');
        if (latestRes.ok) {
          const data = await latestRes.json();
          if (data.status === 'completed' && data.jobId) {
            applyJobStatus(data, setters);
            sessionStorage.setItem(STORAGE_KEY, data.jobId);
          } else if ((data.status === 'pending' || data.status === 'running') && data.jobId) {
            applyJobStatus(data, setters);
            sessionStorage.setItem(STORAGE_KEY, data.jobId);
            startPolling(data.jobId);
          }
        }
      } catch (err) {
        console.error('Init delayed PO report state error:', err);
      }
    };

    init();
    return () => clearPolling();
  }, [clearPolling, startPolling]);

  const handleGenerate = async () => {
    try {
      setState('running');
      setDownloadingFormat(null);
      const res = await fetch('/api/reports/delayed-po-reasons/start', { method: 'POST' });
      const data = await res.json();

      if (!res.ok && res.status !== 202 && res.status !== 200) {
        throw new Error(data.error || 'Failed to start report');
      }

      const id = data.jobId;
      setJobId(id);
      sessionStorage.setItem(STORAGE_KEY, id);

      if (data.status === 'completed') {
        const statusRes = await fetch(`/api/reports/delayed-po-reasons/status/${id}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          applyJobStatus(statusData, setters);
        } else {
          setState('ready');
        }
        toast.success('Report generated');
        return;
      }

      startPolling(id);
      toast.info('Report generation started in background');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to start report');
      const latestRes = await fetch('/api/reports/delayed-po-reasons/status/latest');
      if (latestRes.ok) {
        const latest = await latestRes.json();
        if (latest.status === 'completed' && latest.jobId) {
          applyJobStatus(latest, setters);
          sessionStorage.setItem(STORAGE_KEY, latest.jobId);
          return;
        }
      }
      resetToIdle();
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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Open_PO_Report_${moment(completedAt || undefined).format('YYYY-MM-DD_HH-mm')}.${ext}`;
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

  const reportDateLabel = completedAt
    ? moment(completedAt).format('MMM D, YYYY h:mm A')
    : null;

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FiFileText className="mr-2 h-4 w-4" />
        Generate open PO report
      </button>
    );
  }

  if (state === 'running') {
    const progressText =
      progress.totalPOs > 0
        ? ` (${progress.processedPOs}/${progress.totalPOs} POs)`
        : '';
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-600 bg-gray-100 cursor-not-allowed"
        >
          <FiLoader className="mr-2 h-4 w-4 animate-spin" />
          Generating report…{progressText}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {reportDateLabel && (
        <p className="text-sm text-gray-600">
          Report run on <span className="font-medium text-gray-900">{reportDateLabel}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleDownload('xlsx')}
          disabled={!!downloadingFormat}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloadingFormat === 'xlsx' ? (
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FiDownload className="mr-2 h-4 w-4" />
          )}
          Excel download
        </button>
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          disabled={!!downloadingFormat}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloadingFormat === 'pdf' ? (
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FiDownload className="mr-2 h-4 w-4" />
          )}
          PDF download
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!!downloadingFormat}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Regenerate fresh data
        </button>
      </div>
    </div>
  );
}
