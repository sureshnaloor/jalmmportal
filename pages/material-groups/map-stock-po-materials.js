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
  { key: 'material-type', label: 'SAP Type' },
  { key: 'material-group', label: 'SAP Group' },
  { key: 'unit-measure', label: 'UOM' },
];

export default function MapStockOpenPoMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unmappedOnly, setUnmappedOnly] = useState(true);
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
        unmappedOnly: String(unmappedOnly),
      });

      if (debouncedSearch) {
        params.set('str', debouncedSearch);
      }

      const response = await fetch(
        `/api/materialsubgroupmap/stock-po-list?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      const data = await response.json();
      setMaterials(data.materials || []);
      setSummary(data.summary || null);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);

      if (page > (data.totalPages || 1) && (data.totalPages || 1) > 0) {
        setPage(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching stock/open PO materials:', err);
      setError('Failed to load stock and open PO materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortConfig, unmappedOnly]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const isSelectable = (material) => material.inMaster && !material.mapped;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const toggleMaterial = (material) => {
    if (!isSelectable(material)) return;
    const code = material['material-code'];
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

  const selectableOnPage = materials.filter(isSelectable);

  const toggleSelectAll = () => {
    const pageCodes = selectableOnPage.map((m) => m['material-code']);
    const allSelected =
      pageCodes.length > 0 && pageCodes.every((code) => selectedCodes.has(code));

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
    const pageCodes = selectableOnPage.map((m) => m['material-code']);
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
    selectableOnPage.length > 0 &&
    selectableOnPage.every((m) => selectedCodes.has(m['material-code']));

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>
            Map Stock and Open PO Materials to Groups
          </h1>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => router.push('/material-groups/map-materials')}
            >
              Map All Materials
            </button>
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
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Stock and Open PO Materials</h2>
            <p className={styles.sectionHint}>
              2,739 materials from <em>MATERIALS TOBE HANA QAS.xlsx</em>. Existing SAP
              type and group are shown from the material master (or the Excel list).
              Assign unmapped items to a group–subgroup. Already mapped items use the
              same <code>materialsubgroupmap</code> collection as View Mapped Materials
              and cannot be selected again.
            </p>

            {summary && (
              <div className={styles.searchHint} style={{ marginBottom: '1rem' }}>
                {summary.totalInList.toLocaleString()} in Excel ·{' '}
                {summary.inMasterCount.toLocaleString()} in material master ·{' '}
                {summary.mappedCount.toLocaleString()} already mapped ·{' '}
                {summary.unmappedCount.toLocaleString()} still unmapped
                {summary.missingFromMasterCount > 0 &&
                  ` · ${summary.missingFromMasterCount} not in master`}
              </div>
            )}

            <label
              className={styles.searchLabel}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <input
                type="checkbox"
                checked={unmappedOnly}
                onChange={(e) => {
                  setUnmappedOnly(e.target.checked);
                  setPage(1);
                  setSelectedCodes(new Set());
                }}
              />
              Show unmapped only (hide already mapped)
            </label>

            <div className={styles.searchSection}>
              <label className={styles.searchLabel}>
                Search materials (code, description, SAP type or group)
              </label>
              <input
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. cable or ZCVL*CM10"
              />
              <div className={styles.searchHint}>
                Use * to separate multiple search terms. Results are paginated in batches of 100.
              </div>
            </div>

            <div className={styles.paginationBar}>
              <span>
                {totalCount.toLocaleString()} material{totalCount === 1 ? '' : 's'}
                {unmappedOnly ? ' unmapped' : ''}
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
                disabled={loading || selectableOnPage.length === 0 || allOnPageSelected}
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
                  ? 'No materials match your search.'
                  : unmappedOnly
                    ? 'All stock and open PO materials in this list have been mapped.'
                    : 'No materials found in the stock and open PO list.'}
              </p>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCol}>
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          disabled={selectableOnPage.length === 0}
                          onChange={toggleSelectAll}
                          title="Select all unmapped materials on this page"
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
                      {!unmappedOnly && <th>Mapped To</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => {
                      const code = material['material-code'];
                      const isSelected = selectedCodes.has(code);
                      const selectable = isSelectable(material);
                      const typeLabel = material['material-type-description']
                        ? `${material['material-type']} — ${material['material-type-description']}`
                        : material['material-type'] || '—';
                      const groupLabel = material['material-group-description']
                        ? `${material['material-group']} — ${material['material-group-description']}`
                        : material['material-group'] || '—';
                      return (
                        <tr
                          key={code}
                          className={`${styles.groupRow} ${isSelected ? styles.selectedRow : ''} ${
                            !selectable ? styles.disabledRow : ''
                          }`}
                          onClick={() => toggleMaterial(material)}
                          title={
                            material.mapped
                              ? `Already mapped to ${material.mappedSubgroup?.label || 'a subgroup'}`
                              : !material.inMaster
                                ? 'Not found in the material master'
                                : undefined
                          }
                        >
                          <td className={styles.checkboxCol}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!selectable}
                              onChange={() => toggleMaterial(material)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className={styles.groupName}>{code}</td>
                          <td className={styles.groupDescription}>
                            {material['material-description']}
                          </td>
                          <td className={styles.groupType} title={typeLabel}>
                            {material['material-type'] || '—'}
                          </td>
                          <td className={styles.groupType} title={groupLabel}>
                            {material['material-group'] || '—'}
                          </td>
                          <td>{material['unit-measure'] || '—'}</td>
                          {!unmappedOnly && (
                            <td>
                              {material.mapped
                                ? material.mappedSubgroup?.label || 'Already mapped'
                                : !material.inMaster
                                  ? 'Not in master'
                                  : '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
              Material groups only — service groups are excluded. Same search-and-select
              dropdown as Map Materials.
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
                <strong>{selectedCodes.size}</strong> material
                {selectedCodes.size === 1 ? '' : 's'} selected
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
