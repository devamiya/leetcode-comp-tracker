import React, { useState, useMemo, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Award, AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { computePercentile, useAnalytics } from '../hooks/useAnalytics';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { formatSalary, titleCase, getOfferCurrency } from '../utils/formatters';
import { computeConfidence, getConfidenceColor } from '../utils/confidenceScore';
import OfferCard from '../components/OfferCard';

export default function EvaluatePage() {
  const { data: globalData } = useData();
  const { theme } = useTheme();
  const allOffers = globalData?.offers || [];
  const isDark = theme !== 'light';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';

  const [form, setForm] = useState({
    company: '',
    role: '',
    yoe: '',
    base: '',
    total: '',
    currency: 'INR',
    location: '',
  });
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  // Unique values for autocomplete
  const uniqueCompanies = useMemo(() => {
    const set = new Set();
    allOffers.forEach(o => {
      const c = o.company_normalized || o.company;
      if (c) set.add(c.toLowerCase());
    });
    return [...set].sort();
  }, [allOffers]);

  const evaluate = () => {
    const total = parseFloat(form.total);
    if (!total || isNaN(total)) return;

    // Build comparison set based on filters
    let comparableOffers = [...allOffers];

    // Filter by currency
    if (form.currency) {
      comparableOffers = comparableOffers.filter(o => getOfferCurrency(o) === form.currency);
    }

    // If company specified, find offers at that company
    let companyOffers = [];
    if (form.company) {
      const cn = form.company.toLowerCase();
      companyOffers = comparableOffers.filter(o =>
        (o.company_normalized || o.company || '').toLowerCase().includes(cn)
      );
    }

    // Filter by YOE range (±2 years)
    let yoeOffers = comparableOffers;
    if (form.yoe) {
      const yoe = parseFloat(form.yoe);
      yoeOffers = comparableOffers.filter(o =>
        o.yoe != null && Math.abs(o.yoe - yoe) <= 2
      );
    }

    // Compute percentile rank in overall pool
    const allSalaries = comparableOffers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
    const rank = allSalaries.filter(s => s <= total).length;
    const percentileRank = allSalaries.length > 0 ? Math.round((rank / allSalaries.length) * 100) : null;

    // Compute percentile in YOE-matched pool
    const yoeSalaries = yoeOffers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
    const yoeRank = yoeSalaries.filter(s => s <= total).length;
    const yoePercentile = yoeSalaries.length > 0 ? Math.round((yoeRank / yoeSalaries.length) * 100) : null;

    // Company-specific rank
    const companySalaries = companyOffers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
    const companyRank = companySalaries.filter(s => s <= total).length;
    const companyPercentile = companySalaries.length > 0 ? Math.round((companyRank / companySalaries.length) * 100) : null;

    // Market median
    const overallMedian = computePercentile(allSalaries, 50);
    const overallP75 = computePercentile(allSalaries, 75);
    const overallP90 = computePercentile(allSalaries, 90);

    // Distribution for chart
    const binCount = 20;
    const min = allSalaries[0] || 0;
    const max = allSalaries[allSalaries.length - 1] || 1;
    const binSize = (max - min) / binCount;
    const bins = new Array(binCount).fill(0);
    allSalaries.forEach(v => {
      let idx = Math.floor((v - min) / binSize);
      if (idx >= binCount) idx = binCount - 1;
      bins[idx]++;
    });
    const labels = bins.map((_, i) => formatSalary(min + i * binSize));
    const userBin = Math.min(Math.floor((total - min) / binSize), binCount - 1);

    // Similar offers
    const similar = yoeOffers
      .filter(o => o.total != null)
      .sort((a, b) => Math.abs(a.total - total) - Math.abs(b.total - total))
      .slice(0, 6);

    setResult({
      percentileRank,
      yoePercentile,
      companyPercentile,
      overallMedian,
      overallP75,
      overallP90,
      sampleSize: allSalaries.length,
      yoeSampleSize: yoeSalaries.length,
      companySampleSize: companySalaries.length,
      bins,
      labels,
      userBin,
      similar,
      total,
    });

    // Scroll to results
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getPercentileColor = (p) => {
    if (p >= 75) return 'var(--success)';
    if (p >= 50) return '#4ade80';
    if (p >= 25) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getVerdict = (p) => {
    if (p >= 90) return { text: 'Exceptional', icon: <Award size={20} />, color: 'var(--success)' };
    if (p >= 75) return { text: 'Above Market', icon: <TrendingUp size={20} />, color: '#4ade80' };
    if (p >= 50) return { text: 'At Market', icon: <Minus size={20} />, color: 'var(--warning)' };
    if (p >= 25) return { text: 'Below Market', icon: <TrendingDown size={20} />, color: '#fb923c' };
    return { text: 'Well Below Market', icon: <AlertCircle size={20} />, color: 'var(--danger)' };
  };

  return (
    <div className="page-container">
      <div className="evaluate-split-layout">
        {/* LEFT PANEL — Input Form */}
        <div className="evaluate-left-panel">
          <div className="evaluation-ticket-card" style={{ position: 'sticky', top: '80px' }}>
            <div className="evaluate-hero-header">
              <h2 className="evaluate-hero-title">⚡ Offer Analysis</h2>
              <p className="evaluate-hero-sub">Benchmark against {allOffers.length}+ real offers</p>
            </div>

            <div className="evaluate-form-fields">
              <div className="cyber-input-group">
                <label>Company</label>
                <input
                  type="text"
                  className="multi-select-search"
                  style={{ marginBottom: 0 }}
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  list="company-list"
                />
                <datalist id="company-list">
                  {uniqueCompanies.slice(0, 50).map(c => <option key={c} value={titleCase(c)} />)}
                </datalist>
              </div>

              <div className="cyber-input-group">
                <label>Role</label>
                <input
                  type="text"
                  className="multi-select-search"
                  style={{ marginBottom: 0 }}
                  placeholder="e.g. SDE-2"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                />
              </div>

              <div className="evaluate-form-row">
                <div className="cyber-input-group">
                  <label>YOE</label>
                  <input
                    type="number"
                    className="multi-select-search"
                    style={{ marginBottom: 0 }}
                    placeholder="e.g. 4"
                    value={form.yoe}
                    onChange={e => setForm({ ...form, yoe: e.target.value })}
                    step="0.5"
                    min="0"
                  />
                </div>
                <div className="cyber-input-group">
                  <label>Currency</label>
                  <select
                    className="select-filter"
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="THB">THB</option>
                  </select>
                </div>
              </div>

              <div className="cyber-input-group">
                <label>Base Salary</label>
                <input
                  type="number"
                  className="multi-select-search"
                  style={{ marginBottom: 0 }}
                  placeholder="e.g. 1800000"
                  value={form.base}
                  onChange={e => setForm({ ...form, base: e.target.value })}
                />
              </div>

              <div className="cyber-input-group">
                <label>
                  Total Compensation <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  className="multi-select-search"
                  style={{ marginBottom: 0, borderColor: !form.total ? 'var(--accent-start)' : undefined }}
                  placeholder="e.g. 2500000"
                  value={form.total}
                  onChange={e => setForm({ ...form, total: e.target.value })}
                  required
                />
              </div>

              <div className="cyber-input-group">
                <label>Location</label>
                <input
                  type="text"
                  className="multi-select-search"
                  style={{ marginBottom: 0 }}
                  placeholder="e.g. Bangalore"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>

            <button
              className="btn-cyber-execute"
              onClick={evaluate}
              disabled={!form.total}
            >
              ⚡ Execute Analysis
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — Results */}
        <div className="evaluate-right-panel" ref={resultRef}>
          {!result ? (
            <div className="evaluate-empty-state">
              <div className="evaluate-empty-icon">📊</div>
              <h3>Your Analysis Will Appear Here</h3>
              <p>Fill in your offer details on the left and hit <strong>Execute Analysis</strong> to see how your compensation stacks up against the market.</p>
            </div>
          ) : (
            <>
              {/* Verdict Hero */}
              {result.percentileRank != null && (() => {
                const verdict = getVerdict(result.percentileRank);
                return (
                  <div className="verdict-hero-card" style={{ '--verdict-glow': verdict.color }}>
                    <div className="verdict-hero-content">
                      <div style={{ color: verdict.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        {verdict.icon}
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>{verdict.text}</span>
                      </div>
                      <div className="verdict-percentile" style={{ color: verdict.color }}>
                        {result.percentileRank}th
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        percentile out of {result.sampleSize} {form.currency} offers
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
                        Your offer of <strong style={{ color: 'var(--text-primary)' }}>{formatSalary(result.total)}</strong> is higher than {result.percentileRank}% of reported offers
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Percentile Comparison Cards */}
              <div className="stats-terminal-grid">
                <div className="terminal-stat-card">
                  <div className="terminal-stat-value" style={{ color: getPercentileColor(result.percentileRank || 0) }}>
                    P{result.percentileRank}
                  </div>
                  <div className="terminal-stat-label">Overall Rank</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {result.sampleSize} offers
                  </div>
                </div>

                {result.yoePercentile != null && result.yoeSampleSize >= 3 && (
                  <div className="terminal-stat-card">
                    <div className="terminal-stat-value" style={{ color: getPercentileColor(result.yoePercentile) }}>
                      P{result.yoePercentile}
                    </div>
                    <div className="terminal-stat-label">YOE-Matched Rank</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {result.yoeSampleSize} similar-level offers
                    </div>
                  </div>
                )}

                {result.companyPercentile != null && result.companySampleSize >= 2 && (
                  <div className="terminal-stat-card">
                    <div className="terminal-stat-value" style={{ color: getPercentileColor(result.companyPercentile) }}>
                      P{result.companyPercentile}
                    </div>
                    <div className="terminal-stat-label">At {titleCase(form.company)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {result.companySampleSize} company offers
                    </div>
                  </div>
                )}

                <div className="terminal-stat-card">
                  <div className="terminal-stat-value" style={{ color: 'var(--text-primary)' }}>
                    {formatSalary(result.overallMedian)}
                  </div>
                  <div className="terminal-stat-label">Market Median</div>
                </div>

                <div className="terminal-stat-card">
                  <div className="terminal-stat-value" style={{ color: 'var(--text-primary)' }}>
                    {formatSalary(result.overallP75)}
                  </div>
                  <div className="terminal-stat-label">Market P75</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full-width sections below the split layout */}
      {result && (
        <>
          {/* Distribution Chart */}
          <div className="card card-chart" style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <h2 className="card-title">📊 Where You Stand — Salary Distribution</h2>
            <div className="chart-wrapper chart-wrapper-tall">
              <Bar
                data={{
                  labels: result.labels,
                  datasets: [{
                    label: 'Offers',
                    data: result.bins,
                    backgroundColor: result.bins.map((_, i) =>
                      i === result.userBin
                        ? 'rgba(52, 211, 153, 0.7)'
                        : 'rgba(0, 212, 255, 0.2)'
                    ),
                    borderColor: result.bins.map((_, i) =>
                      i === result.userBin ? '#34d399' : '#00d4ff'
                    ),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: { title: () => '', label: ctx => `${ctx.raw} offers in this range` },
                      backgroundColor: isDark ? 'rgba(18, 18, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      bodyColor: isDark ? 'rgba(232, 232, 240, 0.7)' : 'rgba(22, 32, 51, 0.7)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                      borderWidth: 1, padding: 10, cornerRadius: 8,
                    },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 }, maxRotation: 45 } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
                  },
                }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(52, 211, 153, 0.7)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>
              Your offer range is highlighted in green
            </div>
          </div>

          {/* Similar Offers */}
          {result.similar.length > 0 && (
            <>
              <h2 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>🔍 Similar Offers</h2>
              <div className="offer-cards-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                {result.similar.map((offer, i) => (
                  <OfferCard
                    key={offer.post_url || i}
                    offer={offer}
                    median={result.overallMedian}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
