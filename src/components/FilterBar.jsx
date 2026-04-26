import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { formatSalary } from '../utils/formatters';

/* ─── Multi-Select Dropdown ─── */
function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (val) => {
    onChange(
      selected.includes(val)
        ? selected.filter(s => s !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="multi-select" ref={ref}>
      <button
        className={`multi-select-trigger ${selected.length > 0 ? 'has-selection' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selected.length > 0 ? `${label} (${selected.length})` : placeholder || label}</span>
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="multi-select-dropdown">
          <input
            className="multi-select-search"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {filtered.slice(0, 50).map(opt => (
            <div
              key={opt}
              className={`multi-select-option ${selected.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggle(opt)}
            >
              <span className="multi-select-check">
                {selected.includes(opt) && '✓'}
              </span>
              <span>{opt}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Range Slider ─── */
function RangeSlider({ label, min, max, value, onChange, formatter }) {
  const fmt = formatter || (v => v);
  return (
    <div className="range-slider-container">
      <div className="range-slider-label">{label}</div>
      <div className="range-slider-values">{fmt(value[0])} — {fmt(value[1])}</div>
      <div className="range-slider-track">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={e => onChange([Number(e.target.value), value[1]])}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={e => onChange([value[0], Number(e.target.value)])}
        />
      </div>
    </div>
  );
}

/* ─── Main FilterBar ─── */
export default function FilterBar({ offers, filters, setFilters }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract unique values from offers for dropdowns
  const { companies, roles, locations, yoeRange, compRange } = useMemo(() => {
    if (!offers || offers.length === 0) return {
      companies: [], roles: [], locations: [],
      yoeRange: [0, 30], compRange: [0, 10000000]
    };

    const cs = new Set(), rs = new Set(), ls = new Set();
    let minYoe = Infinity, maxYoe = 0, minComp = Infinity, maxComp = 0;

    offers.forEach(o => {
      const c = o.company_normalized || o.company;
      const r = o.role_normalized || o.role;
      if (c) cs.add(c);
      if (r) rs.add(r);
      if (o.location) ls.add(o.location);
      const yoe = typeof o.yoe === 'string' ? parseFloat(o.yoe) : o.yoe;
      if (yoe != null && !isNaN(yoe)) { minYoe = Math.min(minYoe, yoe); maxYoe = Math.max(maxYoe, yoe); }
      const total = typeof o.total === 'string' ? parseFloat(o.total) : o.total;
      if (total != null && !isNaN(total)) { minComp = Math.min(minComp, total); maxComp = Math.max(maxComp, total); }
    });

    return {
      companies: [...cs].sort(),
      roles: [...rs].sort(),
      locations: [...ls].sort(),
      yoeRange: [minYoe === Infinity ? 0 : Math.floor(minYoe), maxYoe === 0 ? 30 : Math.ceil(maxYoe)],
      compRange: [minComp === Infinity ? 0 : Math.floor(minComp), maxComp === 0 ? 10000000 : Math.ceil(maxComp)],
    };
  }, [offers]);

  const activeCount = [
    filters.companies?.length > 0,
    filters.roles?.length > 0,
    filters.locations?.length > 0,
    filters.yoe && (filters.yoe[0] > yoeRange[0] || filters.yoe[1] < yoeRange[1]),
    filters.recency !== 'all',
  ].filter(Boolean).length;

  const clearAll = () => {
    setFilters({
      companies: [],
      roles: [],
      locations: [],
      yoe: yoeRange,
      comp: compRange,
      currency: filters.currency,
      recency: 'all',
    });
  };

  const recencyOptions = [
    { value: 'all', label: 'All' },
    { value: '30', label: '30d' },
    { value: '90', label: '90d' },
    { value: '180', label: '180d' },
  ];

  return (
    <>
      <button
        className="mobile-filter-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <SlidersHorizontal size={16} />
        Filters {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
      </button>

      <div className={`filter-bar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="filter-bar-section">
          <MultiSelect
            label="Company"
            options={companies}
            selected={filters.companies || []}
            onChange={(v) => setFilters({ ...filters, companies: v })}
            placeholder="Any company"
          />
          <MultiSelect
            label="Role"
            options={roles}
            selected={filters.roles || []}
            onChange={(v) => setFilters({ ...filters, roles: v })}
            placeholder="Any role"
          />
          <MultiSelect
            label="Location"
            options={locations}
            selected={filters.locations || []}
            onChange={(v) => setFilters({ ...filters, locations: v })}
            placeholder="Any location"
          />
        </div>

        <div className="filter-bar-divider" />

        <div className="filter-bar-section">
          <RangeSlider
            label="YOE"
            min={yoeRange[0]}
            max={yoeRange[1]}
            value={filters.yoe || yoeRange}
            onChange={(v) => setFilters({ ...filters, yoe: v })}
          />
        </div>

        <div className="filter-bar-divider" />

        <div className="filter-bar-section">
          <div className="pill-tabs">
            {recencyOptions.map(opt => (
              <button
                key={opt.value}
                className={`pill-tab ${(filters.recency || 'all') === opt.value ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, recency: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {activeCount > 0 && (
          <>
            <div className="filter-bar-divider" />
            <button className="clear-filters-btn" onClick={clearAll}>
              <X size={12} /> Clear all
            </button>
          </>
        )}
      </div>
    </>
  );
}
