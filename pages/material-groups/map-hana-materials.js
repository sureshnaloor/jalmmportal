import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import ConfirmModal from './components/ConfirmModal';

const SORTABLE_COLUMNS = [
  { key: 'material-code', label: 'Material Code' },
  { key: 'material-description', label: 'Description' },
];

const STATIC_COLUMNS = [
  { key: 'material-type', label: 'SAP Type' },
  { key: 'material-group', label: 'SAP Group' },
  { key: 'unit-measure', label: 'UOM' },
];

function sortDisplayedMaterials(items, sortBy, sortOrder) {
  const direction = sortOrder === 'desc' ? -1 : 1;
  const field =
    sortBy === 'material-description' ? 'material-description' : 'material-code';

  return [...items].sort(
    (a, b) =>
      String(a[field] || '').localeCompare(String(b[field] || ''), undefined, {
        numeric: true,
      }) * direction
  );
}

export default function MapHanaMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [unmappedOnly, setUnmappedOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'material-code', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
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
        unmappedOnly: String(unmappedOnly),
        inMasterOnly: 'true',
      });

      if (debouncedSearch) {
        params.set('str', debouncedSearch);
      }

      const response = await fetch(`/api/hanamaterialsmapped/list?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      const data = await response.json();
      setMaterials(data.materials || []);
      setSummary(data.summary || null);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error('Error fetching HANA materials:', err);
      setError('Failed to load HANA selected materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, unmappedOnly]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const displayedMaterials = useMemo(
    () => sortDisplayedMaterials(materials, sortConfig.key, sortConfig.direction),
    [materials, sortConfig]
  );

  const isSelectable = (material) => material.inMaster && !material.mapped;

  const handleSort = (key) => {
    if (!SORTABLE_COLUMNS.some((col) => col.key === key)) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
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

  const selectableMaterials = displayedMaterials.filter(isSelectable);

  const toggleSelectAll = () => {
    const codes = selectableMaterials.map((m) => m['material-code']);
    const allSelected =
      codes.length > 0 && codes.every((code) => selectedCodes.has(code));

    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        codes.forEach((code) => next.delete(code));
      } else {
        codes.forEach((code) => next.add(code));
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

      const response = await fetch('/api/hanamaterialsmapped/map', {
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

  const selectAllVisible = () => {
    const codes = selectableMaterials.map((m) => m['material-code']);
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((code) => next.add(code));
      return next;
    });
  };

  const deselectAll = () => {
    setSelectedCodes(new Set());
  };

  const allVisibleSelected =
    selectableMaterials.length > 0 &&
    selectableMaterials.every((m) => selectedCodes.has(m['material-code']));

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Map HANA Selected Materials</h1>
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
            <h2>HANA Selected Materials</h2>
            <p className={styles.sectionHint}>
              Materials from <em>Selected Materials and suppliers for dev HANA.xlsx</em> that exist in the material master.
              Assign each to the correct material group and subgroup. Mappings are stored separately in{' '}
              <code>hanamaterialsmapped</code> and do not affect the main material subgroup map.
            </p>

            {summary && (
              <div className={styles.searchHint} style={{ marginBottom: '1rem' }}>
                {summary.inMasterCount.toLocaleString()} in material master ·{' '}
                {summary.mappedCount.toLocaleString()} mapped ·{' '}
                {summary.unmappedCount.toLocaleString()} unmapped
                {summary.missingFromMasterCount > 0 &&
                  ` · ${summary.missingFromMasterCount} in Excel but not in master`}
              </div>
            )}

            <label className={styles.searchLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={unmappedOnly}
                onChange={(e) => setUnmappedOnly(e.target.checked)}
              />
              Show unmapped only
            </label>

            <div className={styles.searchSection}>
              <label className={styles.searchLabel}>Search materials (code, description, SAP type or group)</label>
              <input
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. cable or ZMEC*MM15"
              />
              <div className={styles.searchHint}>
                Use * to separate multiple search terms. All matching materials are shown on one page.
              </div>
            </div>

            <div className={styles.paginationBar}>
              <span>
                {totalCount.toLocaleString()} material{totalCount === 1 ? '' : 's'}
                {unmappedOnly ? ' unmapped' : ''}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              </span>
            </div>

            <div className={styles.selectionBar}>
              <button
                type="button"
                className={styles.paginationButton}
                disabled={loading || selectableMaterials.length === 0 || allVisibleSelected}
                onClick={selectAllVisible}
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
            ) : displayedMaterials.length === 0 ? (
              <p className={styles.emptyMessage}>
                {debouncedSearch
                  ? 'No materials match your search.'
                  : unmappedOnly
                    ? 'All HANA selected materials have been mapped.'
                    : 'No materials found in the HANA list.'}
              </p>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCol}>
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAll}
                          disabled={selectableMaterials.length === 0}
                          title="Select all mappable materials"
                        />
                      </th>
                      {SORTABLE_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className={styles.sortableHeader}
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          {sortIndicator(col.key)}
                        </th>
                      ))}
                      {STATIC_COLUMNS.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      {!unmappedOnly && <th>Mapped To</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedMaterials.map((material) => {
                      const code = material['material-code'];
                      const isSelected = selectedCodes.has(code);
                      const selectable = isSelectable(material);
                      return (
                        <tr
                          key={code}
                          className={`${styles.groupRow} ${isSelected ? styles.selectedRow : ''} ${
                            !selectable ? styles.disabledRow : ''
                          }`}
                          onClick={() => toggleMaterial(material)}
                          title={
                            material.mapped
                              ? `Already mapped to ${material.mappedSubgroup?.label || 'subgroup'}`
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
                          <td className={styles.groupType}>{material['material-type'] || '—'}</td>
                          <td className={styles.groupType}>{material['material-group'] || '—'}</td>
                          <td>{material['unit-measure'] || '—'}</td>
                          {!unmappedOnly && (
                            <td>
                              {material.mapped
                                ? material.mappedSubgroup?.label || 'Mapped'
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
