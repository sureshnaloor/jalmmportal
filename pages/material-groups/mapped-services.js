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
  { key: 'mapped-subgroup', label: 'Mapped Subgroup' },
];

export default function MappedServicesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
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
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
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

  const fetchMappedServices = useCallback(async () => {
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

      const response = await fetch(`/api/servicesubgroupmap/mapped?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mapped services');
      }

      const data = await response.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);

      if (page > (data.totalPages || 1) && (data.totalPages || 1) > 0) {
        setPage(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching mapped services:', err);
      setError('Failed to load mapped services');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchMappedServices();
  }, [fetchMappedServices]);

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
    const pageCodes = items.map((item) => item.serviceCode);
    const allSelected = pageCodes.length > 0 && pageCodes.every((code) => selectedCodes.has(code));
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (allSelected) pageCodes.forEach((code) => next.delete(code));
      else pageCodes.forEach((code) => next.add(code));
      return next;
    });
  };

  const selectAllOnPage = () => {
    const pageCodes = items.map((item) => item.serviceCode);
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      pageCodes.forEach((code) => next.add(code));
      return next;
    });
  };

  const deselectAll = () => setSelectedCodes(new Set());

  const requestUpdate = () => {
    if (selectedCodes.size === 0) {
      setError('Please select at least one service');
      return;
    }
    if (!selectedSubgroup) {
      setError('Please select a new service group-subgroup combination');
      return;
    }
    setError(null);
    setConfirmAction('update');
  };

  const requestRemove = () => {
    if (selectedCodes.size === 0) {
      setError('Please select at least one service');
      return;
    }
    setError(null);
    setConfirmAction('remove');
  };

  const executeConfirmedAction = async () => {
    if (confirmAction === 'update') await executeUpdate();
    else if (confirmAction === 'remove') await executeRemove();
  };

  const executeUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/servicesubgroupmap/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCodes: Array.from(selectedCodes),
          subgroupId: selectedSubgroup.value,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update mappings');

      setSuccess(`${data.updatedCount} mapping(s) updated to "${data.subgroup.groupName} - ${data.subgroup.name}".`);
      setSelectedCodes(new Set());
      setSelectedSubgroup(null);
      setConfirmAction(null);
      fetchMappedServices();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update mappings');
      setConfirmAction(null);
    } finally {
      setSaving(false);
    }
  };

  const executeRemove = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/servicesubgroupmap/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceCodes: Array.from(selectedCodes) }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove mappings');

      setSuccess(`${data.deletedCount} mapping(s) removed successfully.`);
      setSelectedCodes(new Set());
      setSelectedSubgroup(null);
      setConfirmAction(null);
      fetchMappedServices();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to remove mappings');
      setConfirmAction(null);
    } finally {
      setSaving(false);
    }
  };

  const allOnPageSelected = items.length > 0 && items.every((item) => selectedCodes.has(item.serviceCode));

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const confirmModalProps =
    confirmAction === 'update'
      ? {
          title: 'Confirm Mapping Update',
          message: `Reassign ${selectedCodes.size} service${selectedCodes.size === 1 ? '' : 's'} to "${selectedSubgroup?.label || ''}"? Please verify the subgroup is correct.`,
          confirmLabel: 'Yes, Update Mapping',
          variant: 'primary',
        }
      : confirmAction === 'remove'
        ? {
            title: 'Confirm Remove Mapping',
            message: `Remove subgroup mapping for ${selectedCodes.size} selected service${selectedCodes.size === 1 ? '' : 's'}? They will return to the unmapped list.`,
            confirmLabel: 'Yes, Remove Mapping',
            variant: 'danger',
          }
        : null;

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Mapped Services</h1>
          <div className={styles.actions}>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups/map-services')}>Map Services</button>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups/service-group-map')}>Upload Services</button>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups')}>Back to Material Groups</button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Mapped Services</h2>
            <p className={styles.sectionHint}>Review and edit existing service-to-subgroup mappings.</p>

            <div className={styles.searchSection}>
              <label className={styles.searchLabel}>Search services (code, description, or subgroup)</label>
              <input type="text" className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g. maintenance or civil*consult" />
              <div className={styles.searchHint}>Use * to separate multiple search terms. Results are paginated in batches of 100.</div>
            </div>

            <div className={styles.paginationBar}>
              <span>{totalCount.toLocaleString()} mapped service{totalCount === 1 ? '' : 's'}{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}</span>
              <div className={styles.paginationControls}>
                <button type="button" className={styles.paginationButton} disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <span className={styles.paginationInfo}>Page {page} of {totalPages}</span>
                <button type="button" className={styles.paginationButton} disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>

            <div className={styles.selectionBar}>
              <button type="button" className={styles.paginationButton} disabled={loading || items.length === 0 || allOnPageSelected} onClick={selectAllOnPage}>Select All</button>
              <button type="button" className={styles.paginationButton} disabled={loading || selectedCodes.size === 0} onClick={deselectAll}>Deselect All</button>
              {selectedCodes.size > 0 && <span className={styles.selectionCount}>{selectedCodes.size} selected</span>}
            </div>

            {loading ? (
              <div className={styles.loading}>Loading mapped services...</div>
            ) : items.length === 0 ? (
              <p className={styles.emptyMessage}>{debouncedSearch ? 'No mapped services match your search.' : 'No services have been mapped yet.'}</p>
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
                  {items.map((item) => {
                    const isSelected = selectedCodes.has(item.serviceCode);
                    return (
                      <tr key={item.mappingId} className={`${styles.groupRow} ${isSelected ? styles.selectedRow : ''}`} onClick={() => toggleService(item.serviceCode)}>
                        <td className={styles.checkboxCol}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleService(item.serviceCode)} onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className={styles.groupName}>{item.serviceCode}</td>
                        <td className={styles.groupDescription}>{item.serviceDescription}</td>
                        <td>{item.unitMeasure || '—'}</td>
                        <td className={styles.mappedSubgroupCol}>{item.mappedLabel || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.subgroupsSection}>
            <h2>Edit Mapping</h2>
            <p className={styles.sectionHint}>Choose a new service subgroup to reassign, or remove the mapping entirely.</p>

            <div className={styles.mappingPanel}>
              <div className={styles.formField}>
                <label>New Service Group – Subgroup</label>
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
                  <p><strong>New target:</strong> {selectedSubgroup.label}</p>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.submitButton} onClick={requestUpdate} disabled={saving || selectedCodes.size === 0 || !selectedSubgroup}>
                  {saving && confirmAction === 'update' ? 'Updating...' : 'Update Mapping'}
                </button>
                <button type="button" className={styles.deleteButton} style={{ width: 'auto', padding: '8px 16px', height: 'auto' }} onClick={requestRemove} disabled={saving || selectedCodes.size === 0}>
                  {saving && confirmAction === 'remove' ? 'Removing...' : 'Remove Mapping'}
                </button>
                <button type="button" className={styles.cancelButton} onClick={() => { setSelectedCodes(new Set()); setSelectedSubgroup(null); }} disabled={saving}>
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={confirmModalProps?.title || ''}
        message={confirmModalProps?.message || ''}
        confirmLabel={confirmModalProps?.confirmLabel || 'Confirm'}
        variant={confirmModalProps?.variant || 'primary'}
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        loading={saving}
      />
      <FooterComponent />
    </>
  );
}
