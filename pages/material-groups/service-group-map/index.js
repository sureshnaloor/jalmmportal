import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Papa from 'papaparse';
import styles from '../MaterialGroups.module.css';
import HeaderComponent from '../../../components/HeaderNewComponent';
import FooterComponent from '../../../components/FooterComponent';
import { parseServiceLineItemRows, SERVICE_TEMPLATE_CSV } from '../../../lib/serviceLineItems';

async function parseExcelFile(file) {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function downloadTemplate() {
  const blob = new Blob([SERVICE_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'servicelineitems-template.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}

export default function ServiceGroupMapPage() {
  const router = useRouter();
  const [parsedRecords, setParsedRecords] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [stats, setStats] = useState({ totalCount: 0, mappedCount: 0, unmappedCount: 0 });
  const [recentServices, setRecentServices] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/services?limit=8');
      const data = await response.json();
      setStats({
        totalCount: data.totalCount || 0,
        mappedCount: data.mappedCount || 0,
        unmappedCount: data.unmappedCount || 0,
      });
      setRecentServices(data.recentServices || []);
    } catch (err) {
      console.error('Failed to load service stats:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setFileName(file.name);
    setParsedRecords([]);
    setParseErrors([]);
    setError(null);
    setSuccess(null);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rows = [];

      if (extension === 'csv') {
        rows = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
          });
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        rows = await parseExcelFile(file);
      } else {
        setError('Please upload a CSV or Excel (.xlsx, .xls) file');
        setParsing(false);
        event.target.value = '';
        return;
      }

      const { records, errors } = parseServiceLineItemRows(rows);
      setParsedRecords(records);
      setParseErrors(errors || []);

      if (records.length === 0) {
        setError('No valid service rows found in file');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse file');
      setParseErrors([err.message || 'Failed to parse file']);
    }

    setParsing(false);
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (parsedRecords.length === 0) {
      setError('Upload a file with valid service data first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRecords }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`Saved ${data.total} service line item(s) to the database.`);
      setParsedRecords([]);
      setParseErrors([]);
      setFileName('');
      loadStats();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    }

    setUploading(false);
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Service Group Map</h1>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => router.push('/material-groups/map-services')}
            >
              Map Services
            </button>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => router.push('/material-groups/mapped-services')}
            >
              Mapped Services
            </button>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => router.push('/material-groups')}
            >
              Back to Material Groups
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Upload Service Line Items</h2>
            <p className={styles.sectionHint}>
              Download the template, fill in your service codes and descriptions, then upload the CSV or Excel file.
              Data is stored in the <strong>services</strong> collection for subgroup mapping.
            </p>

            <div className={styles.uploadActions}>
              <button type="button" className={styles.submitButton} onClick={downloadTemplate}>
                Download Template (CSV)
              </button>
              <a
                href="/templates/servicelineitems-template.csv"
                className={styles.templateLink}
                download
              >
                Direct template link
              </a>
            </div>

            <div className={styles.formField}>
              <label>Select file to upload</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={parsing || uploading}
              />
              {fileName && (
                <div className={styles.searchHint}>Selected: {fileName}</div>
              )}
            </div>

            {parsing && <div className={styles.loading}>Parsing file...</div>}

            {parseErrors.length > 0 && (
              <div className={styles.parseWarnings}>
                <strong>Parse notes:</strong>
                <ul>
                  {parseErrors.slice(0, 8).map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedRecords.length > 0 && (
              <>
                <p className={styles.sectionHint}>
                  Preview: {parsedRecords.length} valid row(s) ready to upload
                </p>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Service Code</th>
                      <th>Description</th>
                      <th>UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.slice(0, 10).map((row) => (
                      <tr key={row.serviceCode} className={styles.groupRow}>
                        <td className={styles.groupName}>{row.serviceCode}</td>
                        <td className={styles.groupDescription}>{row.serviceDescription}</td>
                        <td>{row.unitMeasure || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRecords.length > 10 && (
                  <p className={styles.searchHint}>
                    Showing first 10 of {parsedRecords.length} rows
                  </p>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : `Upload ${parsedRecords.length} Service(s)`}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setParsedRecords([]);
                      setParseErrors([]);
                      setFileName('');
                    }}
                    disabled={uploading}
                  >
                    Clear Preview
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={styles.subgroupsSection}>
            <h2>Service Mapping Status</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.totalCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Services</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.unmappedCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Unmapped</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.mappedCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Mapped</span>
              </div>
            </div>

            <p className={styles.sectionHint}>
              Template columns: <code>service-code</code>, <code>service-description</code>,{' '}
              <code>unit-measure</code> (optional). Existing codes are updated on re-upload.
            </p>

            {recentServices.length > 0 && (
              <>
                <h3 style={{ fontSize: '14px', marginTop: '16px' }}>Recently Updated</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Service Code</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentServices.map((row) => (
                      <tr key={row.serviceCode} className={styles.groupRow}>
                        <td className={styles.groupName}>{row.serviceCode}</td>
                        <td className={styles.groupDescription}>{row.serviceDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  );
}
