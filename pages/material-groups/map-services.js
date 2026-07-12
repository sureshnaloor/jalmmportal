import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import ConfirmModal from './components/ConfirmModal';

const PAGE_SIZE = 100;

const SORT_COLUMNS = [
  { key: 'service-code', label: 'Service Code' },
  { key: 'service-description', label: 'Description' },
  { key: 'unit-measure', label: 'UOM' },
];

export default function MapServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'service-code', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchSubgroupOptions();
  }, []);

  const fetchSubgroupOptions = async () => {
    try {
      const response = await fetch('/api/materialgroups');
      const data = await response.json();
      if (!Array.isArray(data)) return;

      const options = data
        .filter((group) => group.isService)
        .flatMap((group) =>
          (group.subgroups || []).map((subgroup) => ({
            value: subgroup._id,
            label: `${group.name} - ${subgroup.name}`,
            groupName: group.name,
            subgroupName: subgroup.name,
          }))
        )
        .sort((a, b) => a.label.localeCompare(b.label));

      setSubgroupOptions(options);
    } catch (err) {
      console.error('Error fetching service subgroup options:', err);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });

      if (debouncedSearch) {
        params.set('str', debouncedSearch);
      }

      const response = await fetch(`/api/servicesubgroupmap/unmapped?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);

      if (page > (data.totalPages || 1) && (data.totalPages || 1) > 0) {
        setPage(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load unmapped services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const toggleService = (code) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageCodes = services.map((s) => s.serviceCode);
    const allSelected = pageCodes.length > 0 && pageCodes.every((code) => selectedCodes.has(code));
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (allSelected) pageCodes.forEach((code) => next.delete(code));
      else pageCodes.forEach((code) => next.add(code));
      return next;
    });
  };

  const handleMapServices = () => {
    if (selectedCodes.size === 0) {
      setError('Please select at least one service');
      return;
    }
    if (!selectedSubgroup) {
      setError('Please select a service group-subgroup combination');
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  const executeMapServices = async () => {
    try {
      setMapping(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/servicesubgroupmap/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCodes: Array.from(selectedCodes),
          subgroupId: selectedSubgroup.value,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to map services');
      }

      setSuccess(
        `${data.mappedCount} service(s) mapped to "${data.subgroup.groupName} - ${data.subgroup.name}".`
      );
      setSelectedCodes(new Set());
      setSelectedSubgroup(null);
      setShowConfirmModal(false);
      fetchServices();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error mapping services:', err);
      setError(err.message || 'Failed to map services');
      setShowConfirmModal(false);
    } finally {
      setMapping(false);
    }
  };

  const selectAllOnPage = () => {
    const pageCodes = services.map((s) => s.serviceCode);
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      pageCodes.forEach((code) => next.add(code));
      return next;
    });
  };

  const deselectAll = () => setSelectedCodes(new Set());

  const allOnPageSelected =
    services.length > 0 && services.every((s) => selectedCodes.has(s.serviceCode));

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Map Services to Subgroups</h1>
          <div className={styles.actions}>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups/service-group-map')}>
              Upload Services
            </button>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups/mapped-services')}>
              View Mapped Services
            </button>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups')}>
              Back to Material Groups
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Unmapped Services</h2>
            <p className={styles.sectionHint}>
              Only uploaded services not yet assigned to a subgroup are shown. Upload services first if the list is empty.
            </p>

            <div className={styles.searchSection}>
              <label className={styles.searchLabel}>Search services (code or description)</label>
              <input
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. maintenance or consult*annual"
              />
              <div className={styles.searchHint}>
                Use * to separate multiple search terms. Results are paginated in batches of 100.
              </div>
            </div>

            <div className={styles.paginationBar}>
              <span>
                {totalCount.toLocaleString()} unmapped service{totalCount === 1 ? '' : 's'}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              </span>
              <div className={styles.paginationControls}>
                <button type="button" className={styles.paginationButton} disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <span className={styles.paginationInfo}>Page {page} of {totalPages}</span>
                <button type="button" className={styles.paginationButton} disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>

            <div className={styles.selectionBar}>
              <button type="button" className={styles.paginationButton} disabled={loading || services.length === 0 || allOnPageSelected} onClick={selectAllOnPage}>Select All</button>
              <button type="button" className={styles.paginationButton} disabled={loading || selectedCodes.size === 0} onClick={deselectAll}>Deselect All</button>
              {selectedCodes.size > 0 && <span className={styles.selectionCount}>{selectedCodes.size} selected</span>}
            </div>

            {loading ? (
              <div className={styles.loading}>Loading services...</div>
            ) : services.length === 0 ? (
              <p className={styles.emptyMessage}>
                {debouncedSearch ? 'No unmapped services match your search.' : 'No unmapped services. Upload service line items first.'}
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCol}>
                      <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} title="Select all on this page" />
                    </th>
                    {SORT_COLUMNS.map((col) => (
                      <th key={col.key} className={styles.sortableHeader} onClick={() => handleSort(col.key)}>
                        {col.label}{sortIndicator(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => {
                    const code = service.serviceCode;
                    const isSelected = selectedCodes.has(code);
                    return (
                      <tr key={code} className={`${styles.groupRow} ${isSelected ? styles.selectedRow : ''}`} onClick={() => toggleService(code)}>
                        <td className={styles.checkboxCol}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleService(code)} onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className={styles.groupName}>{code}</td>
                        <td className={styles.groupDescription}>{service.serviceDescription}</td>
                        <td>{service.unitMeasure || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.subgroupsSection}>
            <h2>Assign to Service Subgroup</h2>
            <p className={styles.sectionHint}>Service groups only — material groups are excluded.</p>

            <div className={styles.mappingPanel}>
              <div className={styles.formField}>
                <label>Service Group – Subgroup</label>
                <Select
                  options={subgroupOptions}
                  value={selectedSubgroup}
                  onChange={setSelectedSubgroup}
                  placeholder="Search and select service group-subgroup..."
                  isClearable
                  isSearchable
                  className={styles.reactSelect}
                  classNamePrefix="svcmap"
                  noOptionsMessage={() => 'No matching service subgroups'}
                />
              </div>

              <div className={styles.selectionSummary}>
                <strong>{selectedCodes.size}</strong> service{selectedCodes.size === 1 ? '' : 's'} selected
              </div>

              {selectedSubgroup && (
                <div className={styles.selectedTarget}>
                  <p><strong>Target:</strong> {selectedSubgroup.label}</p>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.submitButton} onClick={handleMapServices} disabled={mapping || selectedCodes.size === 0 || !selectedSubgroup}>
                  {mapping ? 'Mapping...' : 'Map Selected Services'}
                </button>
                <button type="button" className={styles.cancelButton} onClick={() => { setSelectedCodes(new Set()); setSelectedSubgroup(null); }} disabled={mapping}>
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        title="Confirm Service Mapping"
        message={`Map ${selectedCodes.size} service${selectedCodes.size === 1 ? '' : 's'} to "${selectedSubgroup?.label || ''}"? Please verify the subgroup is correct before continuing.`}
        confirmLabel="Yes, Map Services"
        onConfirm={executeMapServices}
        onCancel={() => setShowConfirmModal(false)}
        loading={mapping}
      />
      <FooterComponent />
    </>
  );
}
