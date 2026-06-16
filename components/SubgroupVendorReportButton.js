import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiDownload, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import moment from 'moment';

const POLL_INTERVAL_MS = 4000;

function storageKey(subgroupId) {
  return `vendorDbReportJobId:${subgroupId}`;
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

export default function SubgroupVendorReportButton({ subgroupId, groupName, subgroupName, isService }) {
  const [state, setState] = useState('idle');
  const [jobId, setJobId] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ processedVendors: 0, totalVendors: 0 });
  const pollRef = useRef(null);

  const setters = { setJobId, setState, setProgress, setCompletedAt };
  const key = subgroupId ? storageKey(subgroupId) : null;

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
    setDownloading(false);
    setProgress({ processedVendors: 0, totalVendors: 0 });
    if (key) sessionStorage.removeItem(key);
  }, [clearPolling, key]);

  const latestUrl = subgroupId
    ? `/api/reports/vendor-db/status/latest?subgroupId=${encodeURIComponent(subgroupId)}`
    : null;

  const pollStatus = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/reports/vendor-db/status/${id}?subgroupId=${encodeURIComponent(subgroupId)}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'completed') {
        clearPolling();
        applyJobStatus(data, setters);
        if (key) sessionStorage.setItem(key, id);
      } else if (data.status === 'failed') {
        clearPolling();
        toast.error(data.error || 'Report generation failed');
        if (latestUrl) {
          const latestRes = await fetch(latestUrl);
          if (latestRes.ok) {
            const latest = await latestRes.json();
            if (latest.status === 'completed' && latest.jobId) {
              applyJobStatus(latest, setters);
              if (key) sessionStorage.setItem(key, latest.jobId);
              return;
            }
          }
        }
        resetToIdle();
      } else {
        applyJobStatus(data, setters);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, [clearPolling, key, latestUrl, resetToIdle, subgroupId]);

  const startPolling = useCallback((id) => {
    clearPolling();
    pollStatus(id);
    pollRef.current = setInterval(() => pollStatus(id), POLL_INTERVAL_MS);
  }, [clearPolling, pollStatus]);

  useEffect(() => {
    if (!subgroupId || !key || !latestUrl) return undefined;

    const init = async () => {
      try {
        const storedJobId = sessionStorage.getItem(key);
        if (storedJobId) {
          const res = await fetch(`/api/reports/vendor-db/status/${storedJobId}?subgroupId=${encodeURIComponent(subgroupId)}`);
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

        const latestRes = await fetch(latestUrl);
        if (latestRes.ok) {
          const data = await latestRes.json();
          if (data.status === 'completed' && data.jobId) {
            applyJobStatus(data, setters);
            sessionStorage.setItem(key, data.jobId);
          } else if ((data.status === 'pending' || data.status === 'running') && data.jobId) {
            applyJobStatus(data, setters);
            sessionStorage.setItem(key, data.jobId);
            startPolling(data.jobId);
          }
        }
      } catch (err) {
        console.error('Init subgroup vendor report state error:', err);
      }
    };

    init();
    return () => clearPolling();
  }, [clearPolling, key, latestUrl, startPolling, subgroupId]);

  const handleGenerate = async () => {
    if (!subgroupId) return;
    try {
      setState('running');
      setDownloading(false);
      const res = await fetch('/api/reports/vendor-db/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subgroupId, groupName, subgroupName, isService }),
      });
      const data = await res.json();

      if (!res.ok && res.status !== 202 && res.status !== 200) {
        throw new Error(data.error || 'Failed to start report');
      }

      const id = data.jobId;
      setJobId(id);
      if (key) sessionStorage.setItem(key, id);

      if (data.status === 'completed') {
        const statusRes = await fetch(`/api/reports/vendor-db/status/${id}?subgroupId=${encodeURIComponent(subgroupId)}`);
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
      if (latestUrl) {
        const latestRes = await fetch(latestUrl);
        if (latestRes.ok) {
          const latest = await latestRes.json();
          if (latest.status === 'completed' && latest.jobId) {
            applyJobStatus(latest, setters);
            if (key) sessionStorage.setItem(key, latest.jobId);
            return;
          }
        }
      }
      resetToIdle();
    }
  };

  const handleDownload = async () => {
    if (!jobId || downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(`/api/reports/vendor-db/download/${jobId}?format=pdf`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Download failed');
      }

      const blob = await res.blob();
      const safeName = (subgroupName || 'subgroup').replace(/[^\w\-]+/g, '_').slice(0, 40);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vendor_Report_${safeName}_${moment(completedAt || undefined).format('YYYY-MM-DD_HH-mm')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!subgroupId) return null;

  const reportDateLabel = completedAt
    ? moment(completedAt).format('MMM D, YYYY h:mm A')
    : null;

  const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center';

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500`}
      >
        Generate report
      </button>
    );
  }

  if (state === 'running') {
    const progressText =
      progress.totalVendors > 0
        ? ` (${progress.processedVendors}/${progress.totalVendors})`
        : '';
    return (
      <button
        type="button"
        disabled
        className={`${btnBase} bg-slate-100 text-slate-600 cursor-not-allowed`}
      >
        <FiLoader className="mr-2 h-4 w-4 animate-spin" />
        Generating…{progressText}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {reportDateLabel && (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Run: <span className="font-medium text-slate-700">{reportDateLabel}</span>
        </span>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`${btnBase} bg-red-600 text-white hover:bg-red-500 focus:ring-red-500`}
      >
        {downloading ? (
          <FiLoader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FiDownload className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </button>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={downloading}
        className={`${btnBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400`}
      >
        <FiRefreshCw className="mr-2 h-4 w-4" />
        Regenerate
      </button>
    </div>
  );
}
