import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import ConfirmModal from './components/ConfirmModal';

const PAGE_SIZE = 100;

const SORT_COLUMNS = [
  { key: 'material-code', label: 'Material Code' },
  { key: 'material-description', label: 'Description' },
  { key: 'material-group', label: 'SAP Group' },
  { key: 'unit-measure', label: 'UOM' },
];

export default function MapMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'material-code', direction: 'asc' });
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
        .filter((group) => !group.isService)
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
      console.error('Error fetching subgroup options:', err);
    }
  };

  const fetchMaterials = useCallback(async () => {
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

      const response = await fetch(`/api/materialsubgroupmap/unmapped?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      const data = await response.json();
      setMaterials(data.materials || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);

      if (page > (data.totalPages || 1) && (data.totalPages || 1) > 0) {
        setPage(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load unmapped materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const toggleMaterial = (code) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageCodes = materials.map((m) => m['material-code']);
    const allSelected = pageCodes.length > 0 && pageCodes.every((code) => selectedCodes.has(code));

    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageCodes.forEach((code) => next.delete(code));
      } else {
        pageCodes.forEach((code) => next.add(code));
      }
      return next;
    });
  };

  const handleMapMaterials = async () => {
    if (selectedCodes.size === 0) {
      setError('Please select at least one material');
      return;
    }

    if (!selectedSubgroup) {
      setError('Please select a group-subgroup combination');
      return;
    }

    setError(null);
    setShowConfirmModal(true);
  };

  const executeMapMaterials = async () => {
    try {
      setMapping(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/materialsubgroupmap/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialCodes: Array.from(selectedCodes),
          subgroupId: selectedSubgroup.value,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to map materials');
      }

      setSuccess(
        `${data.mappedCount} material(s) mapped to "${data.subgroup.groupName} - ${data.subgroup.name}".`
      );
      setSelectedCodes(new Set());
      setSelectedSubgroup(null);
      setShowConfirmModal(false);
      fetchMaterials();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error mapping materials:', err);
      setError(err.message || 'Failed to map materials');
      setShowConfirmModal(false);
    } finally {
      setMapping(false);
    }
  };

  const selectAllOnPage = () => {
    const pageCodes = materials.map((m) => m['material-code']);
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      pageCodes.forEach((code) => next.add(code));
      return next;
    });
  };

  const deselectAll = () => {
    setSelectedCodes(new Set());
  };

  const allOnPageSelected =
    materials.length > 0 && materials.every((m) => selectedCodes.has(m['material-code']));

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Map Materials to Subgroups</h1>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => router.push('/material-groups/mapped-materials')}
            >
              View Mapped Materials
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
        {success && (
          <div className={styles.successMessage}>{success}</div>
        )}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Unmapped Materials</h2>
            <p className={styles.sectionHint}>
              Only materials not yet assigned to a subgroup are shown. Select one or more, then choose a subgroup on the right.
            </p>

            <div className={styles.searchSection}>
              <label className={styles.searchLabel}>Search materials (code or description)</label>
              <input
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. cable or cable*240*arm"
              />
              <div className={styles.searchHint}>
                Use * to separate multiple search terms. Results are paginated in batches of 100.
              </div>
            </div>

            <div className={styles.paginationBar}>
              <span>
                {totalCount.toLocaleString()} unmapped material{totalCount === 1 ? '' : 's'}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              </span>
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className={styles.selectionBar}>
              <button
                type="button"
                className={styles.paginationButton}
                disabled={loading || materials.length === 0 || allOnPageSelected}
                onClick={selectAllOnPage}
              >
                Select All
              </button>
              <button
                type="button"
                className={styles.paginationButton}
                disabled={loading || selectedCodes.size === 0}
                onClick={deselectAll}
              >
                Deselect All
              </button>
              {selectedCodes.size > 0 && (
                <span className={styles.selectionCount}>
                  {selectedCodes.size} selected
                </span>
              )}
            </div>

            {loading ? (
              <div className={styles.loading}>Loading materials...</div>
            ) : materials.length === 0 ? (
              <p className={styles.emptyMessage}>
                {debouncedSearch
                  ? 'No unmapped materials match your search.'
                  : 'All materials have been mapped to subgroups.'}
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                        title="Select all on this page"
                      />
                    </th>
                    {SORT_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={styles.sortableHeader}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                        {sortIndicator(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => {
                    const code = material['material-code'];
                    const isSelected = selectedCodes.has(code);
                    return (
                      <tr
                        key={code}
                        className={`${styles.groupRow} ${isSelected ? styles.selectedRow : ''}`}
                        onClick={() => toggleMaterial(code)}
                      >
                        <td className={styles.checkboxCol}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMaterial(code)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={styles.groupName}>{code}</td>
                        <td className={styles.groupDescription}>
                          {material['material-description']}
                        </td>
                        <td className={styles.groupType}>{material['material-group'] || '—'}</td>
                        <td>{material['unit-measure'] || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && materials.length > 0 && totalPages > 1 && (
              <div className={styles.paginationBar}>
                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className={styles.paginationInfo}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.subgroupsSection}>
            <h2>Assign to Subgroup</h2>
            <p className={styles.sectionHint}>
              Material groups only — service groups are excluded.
            </p>

            <div className={styles.mappingPanel}>
              <div className={styles.formField}>
                <label>Group – Subgroup</label>
                <Select
                  options={subgroupOptions}
                  value={selectedSubgroup}
                  onChange={setSelectedSubgroup}
                  placeholder="Search and select group-subgroup..."
                  isClearable
                  isSearchable
                  className={styles.reactSelect}
                  classNamePrefix="matmap"
                  noOptionsMessage={() => 'No matching subgroups'}
                />
              </div>

              <div className={styles.selectionSummary}>
                <strong>{selectedCodes.size}</strong> material{selectedCodes.size === 1 ? '' : 's'} selected
              </div>

              {selectedSubgroup && (
                <div className={styles.selectedTarget}>
                  <p>
                    <strong>Target:</strong> {selectedSubgroup.label}
                  </p>
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleMapMaterials}
                  disabled={mapping || selectedCodes.size === 0 || !selectedSubgroup}
                >
                  {mapping ? 'Mapping...' : 'Map Selected Materials'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setSelectedCodes(new Set());
                    setSelectedSubgroup(null);
                  }}
                  disabled={mapping}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirmModal}
        title="Confirm Material Mapping"
        message={`Map ${selectedCodes.size} material${selectedCodes.size === 1 ? '' : 's'} to "${selectedSubgroup?.label || ''}"? Please verify the subgroup is correct before continuing.`}
        confirmLabel="Yes, Map Materials"
        onConfirm={executeMapMaterials}
        onCancel={() => setShowConfirmModal(false)}
        loading={mapping}
      />
      <FooterComponent />
    </>
  );
}
