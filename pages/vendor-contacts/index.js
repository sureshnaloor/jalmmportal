import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';

const COLUMNS = [
  { key: 'vendorCode', label: 'Vendor Code' },
  { key: 'vendorName', label: 'Vendor Name' },
  { key: 'poCount', label: 'PO Count' },
  { key: 'lastPoDate', label: 'Last PO Date' },
];

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}

export default function VendorContactsIndexPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'vendorName', direction: 'asc' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports/vendors/active');
        if (!response.ok) throw new Error('Failed to load active vendors');
        const data = await response.json();
        setVendors(Array.isArray(data.vendors) ? data.vendors : []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load active vendors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayedVendors = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? vendors.filter((vendor) =>
          `${vendor.vendorCode || ''} ${vendor.vendorName || ''}`.toLowerCase().includes(term)
        )
      : [...vendors];

    const { key, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (key === 'poCount') {
        return ((a.poCount || 0) - (b.poCount || 0)) * multiplier;
      }
      if (key === 'lastPoDate') {
        const aTime = a.lastPoDate ? new Date(a.lastPoDate).getTime() : 0;
        const bTime = b.lastPoDate ? new Date(b.lastPoDate).getTime() : 0;
        return (aTime - bTime) * multiplier;
      }
      return String(a[key] || '').localeCompare(String(b[key] || '')) * multiplier;
    });
    return filtered;
  }, [vendors, search, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc'
      ? <FiArrowUp className="inline ml-1" />
      : <FiArrowDown className="inline ml-1" />;
  };

  const openVendorContacts = (vendor) => {
    router.push({
      pathname: '/vendor-contacts/[vendorcode]',
      query: {
        vendorcode: vendor.vendorCode,
        vendorName: vendor.vendorName || '',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <HeaderComponent />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Vendor Contacts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Active vendors with purchase-order activity. Open a vendor to view or edit contact and address information.
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendor code or name..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-slate-600">
            {displayedVendors.length.toLocaleString()} active vendor{displayedVendors.length === 1 ? '' : 's'}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-600">
            Loading active vendors...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-700"
                      onClick={() => requestSort(column.key)}
                    >
                      {column.label}
                      <SortIndicator columnKey={column.key} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedVendors.map((vendor) => (
                  <tr key={vendor.vendorCode} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-900">{vendor.vendorCode}</td>
                    <td className="px-4 py-3 text-slate-900">{vendor.vendorName || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-700">{vendor.poCount ?? 0}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(vendor.lastPoDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openVendorContacts(vendor)}
                        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        View / Edit Contacts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedVendors.length === 0 && (
              <p className="px-4 py-10 text-center text-slate-500">No active vendors found.</p>
            )}
          </div>
        )}
      </main>
      <FooterComponent />
    </div>
  );
}
