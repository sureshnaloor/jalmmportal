import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

function buildGroupOptions(groups) {
  return groups.flatMap((group) =>
    (group.subgroups || []).map((subgroup) => ({
      value: String(subgroup._id),
      label: `${group.name} — ${subgroup.name}`,
      groupName: group.name,
      subgroupName: subgroup.name,
      isService: Boolean(group.isService),
    }))
  );
}

export default function VendorEvaluationGroupSection({ vendorCode, vendorName, disabled = false }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [allOptions, setAllOptions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [filterText, setFilterText] = useState('');

  const loadData = useCallback(async () => {
    if (!vendorCode) return;
    setLoading(true);
    try {
      const [groupsRes, mapRes] = await Promise.all([
        fetch('/api/materialgroups'),
        fetch(`/api/vendorgroupmap?vendorCode=${encodeURIComponent(vendorCode)}`),
      ]);

      if (!groupsRes.ok || !mapRes.ok) {
        throw new Error('Failed to load group mappings');
      }

      const groups = await groupsRes.json();
      const rawMappings = await mapRes.json();
      const options = buildGroupOptions(groups);
      const optionById = new Map(options.map((o) => [o.value, o]));

      const current = rawMappings
        .map((m) => optionById.get(String(m.subgroupId)))
        .filter(Boolean)
        .sort((a, b) => {
          if (a.isService !== b.isService) return a.isService ? 1 : -1;
          return a.label.localeCompare(b.label);
        });

      setAllOptions(options);
      setMappings(current);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load material/service group mappings');
    }
    setLoading(false);
  }, [vendorCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mappedIds = useMemo(() => new Set(mappings.map((m) => m.value)), [mappings]);

  const availableOptions = useMemo(() => {
    let opts = allOptions.filter((o) => !mappedIds.has(o.value));
    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      opts = opts.filter(
        (o) =>
          o.groupName.toLowerCase().includes(q) ||
          o.subgroupName.toLowerCase().includes(q) ||
          o.label.toLowerCase().includes(q)
      );
    }
    return opts;
  }, [allOptions, mappedIds, filterText]);

  const materialMappings = mappings.filter((m) => !m.isService);
  const serviceMappings = mappings.filter((m) => m.isService);

  const handleAdd = async () => {
    if (!selectedOption || disabled) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vendorgroupmap/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorCode,
          subgroupId: selectedOption.value,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add mapping');

      setMappings((prev) =>
        [...prev, selectedOption].sort((a, b) => {
          if (a.isService !== b.isService) return a.isService ? 1 : -1;
          return a.label.localeCompare(b.label);
        })
      );
      setSelectedOption(null);
      toast.success('Group mapping added');
    } catch (err) {
      toast.error(err.message || 'Failed to add mapping');
    }
    setSaving(false);
  };

  const handleRemove = async (mapping) => {
    if (disabled) return;
    setRemovingId(mapping.value);
    try {
      const res = await fetch('/api/vendorgroupmap/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subgroupId: mapping.value,
          vendorCode,
          isUnregistered: false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove mapping');

      setMappings((prev) => prev.filter((m) => m.value !== mapping.value));
      toast.success('Group mapping removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove mapping');
    }
    setRemovingId(null);
  };

  const selectStyles = {
    control: (base) => ({ ...base, minHeight: 42 }),
    menu: (base) => ({ ...base, zIndex: 40 }),
  };

  const renderList = (title, items, accent) => (
    <div className={`rounded-lg border ${accent.border} ${accent.bg} overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${accent.headerBorder} ${accent.headerBg}`}>
        <h3 className={`text-sm font-semibold ${accent.title}`}>{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{items.length} mapped</p>
      </div>
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No groups mapped</p>
        ) : (
          items.map((item) => (
            <div
              key={item.value}
              className="flex items-start justify-between gap-2 bg-white rounded-md border border-gray-100 px-3 py-2 shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.subgroupName}</p>
                <p className="text-xs text-gray-500 truncate">{item.groupName}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.value}
                  className="shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  title="Remove mapping"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="mb-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Material &amp; Service Groups</h2>
        <p className="text-sm text-gray-600 mt-1">
          Groups mapped to vendor <strong>{vendorName || vendorCode}</strong> ({vendorCode}). Add or remove mappings during evaluation.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {!disabled && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm font-medium text-blue-900 mb-3">Add new group mapping</p>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter available groups…"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                />
                <Select
                  options={availableOptions}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  placeholder="Select material or service subgroup…"
                  isClearable
                  styles={selectStyles}
                  classNamePrefix="select"
                  noOptionsMessage={() => 'No available groups (all may already be mapped)'}
                />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedOption || saving}
                className="inline-flex items-center justify-center px-4 py-2 h-fit text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 lg:self-end"
              >
                <FiPlus className="mr-2" />
                {saving ? 'Adding…' : 'Add Group'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderList('Material Groups', materialMappings, {
            border: 'border-emerald-200',
            bg: 'bg-emerald-50/30',
            headerBorder: 'border-emerald-100',
            headerBg: 'bg-emerald-50',
            title: 'text-emerald-900',
          })}
          {renderList('Service Groups', serviceMappings, {
            border: 'border-violet-200',
            bg: 'bg-violet-50/30',
            headerBorder: 'border-violet-100',
            headerBg: 'bg-violet-50',
            title: 'text-violet-900',
          })}
        </div>
      </div>
    </section>
  );
}
