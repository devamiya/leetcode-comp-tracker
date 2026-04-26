import React, { useState, useMemo } from 'react';
import { Search, X, Plus, BarChart2 } from 'lucide-react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, ArcElement, Filler
} from 'chart.js';
import { computePercentile } from '../hooks/useAnalytics';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { formatSalary, titleCase } from '../utils/formatters';
import CompanyLogo from '../components/CompanyLogo';

ChartJS.register(RadialLinearScale, ArcElement, Filler);

function CompanySearchSelect({ companies, selected, onAdd, onRemove, maxItems = 4 }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = search
    ? companies.filter(c => c.toLowerCase().includes(search.toLowerCase()) && !selected.includes(c))
    : companies.filter(c => !selected.includes(c));

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
        {selected.map(c => (
          <span key={c} className="company-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}>
            <CompanyLogo name={c} size={20} />
            {titleCase(c)}
            <button onClick={() => onRemove(c)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          </span>
        ))}
        {selected.length < maxItems && (
          <div className="multi-select" style={{ minWidth: 200 }}>
            <button
              className="multi-select-trigger"
              onClick={() => setIsOpen(!isOpen)}
              type="button"
            >
              <Plus size={14} />
              <span>Add Company ({selected.length}/{maxItems})</span>
            </button>
            {isOpen && (
              <div className="multi-select-dropdown">
                <input
                  className="multi-select-search"
                  placeholder="Search companies..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                {filtered.slice(0, 30).map(c => (
                  <div
                    key={c}
                    className="multi-select-option"
                    onClick={() => { onAdd(c); setSearch(''); setIsOpen(false); }}
                  >
                    <CompanyLogo name={c} size={20} />
                    <span>{titleCase(c)}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No matches</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { data: globalData } = useData();
  const { theme } = useTheme();
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const allOffers = globalData?.offers || [];
  const isDark = theme !== 'light';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';

  const companyNames = useMemo(() => {
    const set = new Set();
    allOffers.forEach(o => {
      const c = (o.company_normalized || o.company || '').toLowerCase();
      if (c && c !== 'unknown') set.add(c);
    });
    return [...set].sort();
  }, [allOffers]);

  const companyData = useMemo(() => {
    return selectedCompanies.map(name => {
      const offers = allOffers.filter(o =>
        (o.company_normalized || o.company || '').toLowerCase() === name.toLowerCase()
      );
      const salaries = offers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
      const yoes = offers.map(o => o.yoe).filter(y => y != null && !isNaN(y));

      return {
        name,
        displayName: titleCase(name),
        offerCount: offers.length,
        salaryCount: salaries.length,
        median: computePercentile(salaries, 50),
        p25: computePercentile(salaries, 25),
        p75: computePercentile(salaries, 75),
        p90: computePercentile(salaries, 90),
        min: salaries[0] || null,
        max: salaries[salaries.length - 1] || null,
        avgYoe: yoes.length > 0 ? (yoes.reduce((a, b) => a + b, 0) / yoes.length).toFixed(1) : null,
        locations: [...new Set(offers.map(o => o.location).filter(Boolean))],
      };
    });
  }, [selectedCompanies, allOffers]);

  const COLORS = ['#00d4ff', '#7c5cff', '#34d399', '#fbbf24'];
  const COLORS_BG = ['rgba(0,212,255,0.15)', 'rgba(124,92,255,0.15)', 'rgba(52,211,153,0.15)', 'rgba(251,191,36,0.15)'];

  // Bar chart — median comparison
  const barData = {
    labels: companyData.map(c => c.displayName),
    datasets: [
      { label: 'P25', data: companyData.map(c => c.p25), backgroundColor: COLORS_BG, borderColor: COLORS, borderWidth: 1, borderRadius: 4 },
      { label: 'Median', data: companyData.map(c => c.median), backgroundColor: COLORS.map(c => c + 'aa'), borderColor: COLORS, borderWidth: 1.5, borderRadius: 6 },
      { label: 'P75', data: companyData.map(c => c.p75), backgroundColor: COLORS_BG, borderColor: COLORS, borderWidth: 1, borderRadius: 4 },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } },
      tooltip: {
        callbacks: { label: ctx => `${ctx.dataset.label}: ${formatSalary(ctx.raw)}` },
        backgroundColor: isDark ? 'rgba(18, 18, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#e8e8f0' : '#162033',
        bodyColor: isDark ? 'rgba(232, 232, 240, 0.7)' : 'rgba(22, 32, 51, 0.7)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
        borderWidth: 1, padding: 12, cornerRadius: 10,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
    },
  };

  // Find winners
  const winners = useMemo(() => {
    if (companyData.length < 2) return {};
    const metrics = ['median', 'p75', 'p90', 'offerCount'];
    const result = {};
    metrics.forEach(m => {
      let best = companyData[0];
      companyData.forEach(c => { if ((c[m] || 0) > (best[m] || 0)) best = c; });
      result[m] = best.name;
    });
    return result;
  }, [companyData]);

  return (
    <div className="page-container">
      <h1 className="page-title">Compare Companies</h1>
      <p className="page-subtitle">Select up to 4 companies to compare side-by-side</p>

      <CompanySearchSelect
        companies={companyNames}
        selected={selectedCompanies}
        onAdd={(c) => setSelectedCompanies(prev => [...prev, c])}
        onRemove={(c) => setSelectedCompanies(prev => prev.filter(x => x !== c))}
      />

      {companyData.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <div className="empty-state-title">Select companies to compare</div>
          <div className="empty-state-text">Add at least 2 companies using the selector above to see a side-by-side comparison</div>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(companyData.length, 4)}, 1fr)`, gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {companyData.map((c, i) => (
              <div key={c.name} className="card card-stat" style={{ borderTop: `3px solid ${COLORS[i]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
                  <CompanyLogo name={c.name} size={28} />
                  <strong style={{ fontSize: '1rem' }}>{c.displayName}</strong>
                </div>
                <div className="stat-value" style={{ color: COLORS[i] }}>
                  {c.median != null ? formatSalary(c.median) : '—'}
                </div>
                <div className="stat-label">Median Comp</div>
                <div style={{ marginTop: 'var(--space-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>P75</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.p75 != null ? formatSalary(c.p75) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>P90</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.p90 != null ? formatSalary(c.p90) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Offers</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.offerCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Avg YOE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.avgYoe || '—'}</div>
                  </div>
                </div>
                {/* Winner badges */}
                <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {winners.median === c.name && <span className="offer-card-market above" style={{ fontSize: '0.6rem' }}>🏆 Highest Median</span>}
                  {winners.p75 === c.name && <span className="offer-card-market above" style={{ fontSize: '0.6rem' }}>💎 Highest P75</span>}
                  {winners.offerCount === c.name && <span className="offer-card-market at" style={{ fontSize: '0.6rem' }}>📊 Most Data</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Compensation Bar Chart */}
          {companyData.length >= 2 && (
            <div className="card card-chart" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 className="card-title">📊 Compensation Comparison (P25 / Median / P75)</h2>
              <div className="chart-wrapper chart-wrapper-tall">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          )}

          {/* Detailed Comparison Table */}
          <div className="card card-table">
            <h2 className="card-title">📋 Detailed Comparison</h2>
            <div className="table-scroll">
              <table className="offers-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {companyData.map((c, i) => (
                      <th key={c.name} style={{ color: COLORS[i] }}>{c.displayName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Total Offers', key: 'offerCount', format: false },
                    { label: 'Minimum', key: 'min', format: true },
                    { label: 'P25', key: 'p25', format: true },
                    { label: 'Median', key: 'median', format: true },
                    { label: 'P75', key: 'p75', format: true },
                    { label: 'P90', key: 'p90', format: true },
                    { label: 'Maximum', key: 'max', format: true },
                    { label: 'Avg YOE', key: 'avgYoe', format: false },
                  ].map(({ label, key, format }) => {
                    // Find winner for this metric
                    let winnerName = null;
                    if (companyData.length >= 2) {
                      let best = companyData[0];
                      companyData.forEach(c => {
                        if ((c[key] || 0) > (best[key] || 0)) best = c;
                      });
                      winnerName = best.name;
                    }
                    return (
                      <tr key={key}>
                        <td style={{ fontWeight: 600 }}>{label}</td>
                        {companyData.map(c => (
                          <td
                            key={c.name}
                            style={winnerName === c.name ? { color: 'var(--success)', fontWeight: 700 } : {}}
                          >
                            {c[key] != null ? (format ? formatSalary(c[key]) : c[key]) : '—'}
                            {winnerName === c.name && ' ✓'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ fontWeight: 600 }}>Locations</td>
                    {companyData.map(c => (
                      <td key={c.name} style={{ fontSize: '0.78rem' }}>
                        {c.locations.slice(0, 3).join(', ') || '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
