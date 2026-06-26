import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import HeaderNewComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parseWbsDescriptionRows } from '../../lib/wbsDescriptions';

const SAMPLE_CSV = `wbs-number,wbs-description
ED/CP.25.002,Main Project
ED/CP.25.002.01,Civil Works
ED/CP.25.002.01.001,Foundation Package`;

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'wbs-descriptions-template.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}

async function parseExcelFile(file) {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function WbsDescriptionsUploadPage() {
  const [parsedRecords, setParsedRecords] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [stats, setStats] = useState({ totalCount: 0 });
  const [recentRecords, setRecentRecords] = useState([]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/wbsdescriptions?limit=10');
      const data = await response.json();
      setStats({ totalCount: data.totalCount || 0 });
      setRecentRecords(data.records || []);
    } catch (error) {
      console.error('Failed to load WBS description stats:', error);
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
        toast.error('Please upload a CSV or Excel (.xlsx, .xls) file');
        setParsing(false);
        return;
      }

      const { records, errors } = parseWbsDescriptionRows(rows);
      setParsedRecords(records);
      setParseErrors(errors || []);

      if (records.length === 0) {
        toast.warn('No valid rows found in file');
      } else {
        toast.success(`Parsed ${records.length} WBS record(s)`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file');
      setParseErrors([error.message || 'Failed to parse file']);
    }

    setParsing(false);
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (parsedRecords.length === 0) {
      toast.warn('Upload a file with valid WBS data first');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/wbsdescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRecords }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`Saved ${data.total} WBS description(s)`);
      setParsedRecords([]);
      setParseErrors([]);
      setFileName('');
      loadStats();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderNewComponent />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">WBS Descriptions Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload a CSV or Excel file mapping WBS numbers to descriptions. These appear on the Project-wise POs WBS tree.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.totalCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">WBS descriptions stored</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center md:col-span-2">
            <div className="text-sm text-gray-600">
              Required columns: <span className="font-medium">wbs-number</span> and{' '}
              <span className="font-medium">wbs-description</span> (flexible header names accepted)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Upload File</h2>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              <FiDownload className="mr-1.5" />
              Download template
            </button>
          </div>

          <div className="p-6">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
              <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {parsing ? 'Parsing file...' : 'Click to select CSV or Excel file'}
              </span>
              {fileName && <span className="text-xs text-gray-500 mt-1">{fileName}</span>}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
                disabled={parsing || uploading}
              />
            </label>

            {parseErrors.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center text-amber-800 text-sm font-medium mb-1">
                  <FiAlertCircle className="mr-1.5" />
                  Parse notes
                </div>
                <ul className="text-xs text-amber-700 list-disc list-inside max-h-24 overflow-y-auto">
                  {parseErrors.slice(0, 10).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedRecords.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h3 className="font-medium text-gray-800">
                    Preview ({parsedRecords.length} row{parsedRecords.length !== 1 ? 's' : ''})
                  </h3>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FiCheckCircle className="mr-1.5" />
                    {uploading ? 'Saving...' : 'Save to database'}
                  </button>
                </div>

                <div className="overflow-x-auto border rounded-lg max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">WBS Number</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">WBS Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRecords.slice(0, 100).map((row, index) => (
                        <tr key={`${row.wbsNumber}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono text-gray-900">{row.wbsNumber}</td>
                          <td className="px-4 py-2 text-gray-700">{row.wbsDescription || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRecords.length > 100 && (
                    <p className="text-xs text-gray-500 p-2 border-t">
                      Showing first 100 of {parsedRecords.length} rows
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {recentRecords.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiFileText className="mr-2" />
                Recently stored (sample)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">WBS Number</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRecords.map((row) => (
                    <tr key={row['wbs-number']}>
                      <td className="px-4 py-2 font-mono">{row['wbs-number']}</td>
                      <td className="px-4 py-2">{row['wbs-description'] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
      <FooterComponent />
    </div>
  );
}

export default WbsDescriptionsUploadPage;
