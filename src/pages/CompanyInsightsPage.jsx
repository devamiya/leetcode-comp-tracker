import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, MapPin, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { computePercentile } from '../hooks/useAnalytics';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { formatSalary, titleCase, getOfferCurrency } from '../utils/formatters';
import CompanyLogo from '../components/CompanyLogo';
import OfferCard from '../components/OfferCard';

export default function CompanyInsightsPage() {
  const { data: globalData } = useData();
  const { theme } = useTheme();
  const { name } = useParams();

  const { companyOffers, stats, roleBreakdown } = useMemo(() => {
    if (!globalData?.offers || !name) return { companyOffers: [], stats: null, roleBreakdown: [] };

    const normalizedName = decodeURIComponent(name).toLowerCase();
    const offers = globalData.offers.filter(o => {
      const cn = (o.company_normalized || o.company || '').toLowerCase();
      return cn === normalizedName;
    });

    const salaries = offers.map(o => o.total).filter(t => t != null).sort((a, b) => a - b);
    const yoes = offers.map(o => o.yoe).filter(y => y != null).sort((a, b) => a - b);

    const stats = {
      offerCount: offers.length,
      salaryCount: salaries.length,
      min: salaries.length > 0 ? salaries[0] : null,
      max: salaries.length > 0 ? salaries[salaries.length - 1] : null,
      median: computePercentile(salaries, 50),
      p25: computePercentile(salaries, 25),
      p75: computePercentile(salaries, 75),
      p90: computePercentile(salaries, 90),
      avgYoe: yoes.length > 0 ? (yoes.reduce((a, b) => a + b, 0) / yoes.length).toFixed(1) : null,
      locations: [...new Set(offers.map(o => o.location).filter(Boolean))],
    };

    // Role breakdown
    const roles = {};
    offers.forEach(o => {
      const r = o.role_normalized || o.role || 'Unknown';
      if (!roles[r]) roles[r] = { name: r, salaries: [], count: 0 };
      roles[r].count++;
      if (o.total != null) roles[r].salaries.push(o.total);
    });

    const roleBreakdown = Object.values(roles)
      .map(r => ({
        ...r,
        median: computePercentile([...r.salaries].sort((a, b) => a - b), 50),
      }))
      .sort((a, b) => b.count - a.count);

    return { companyOffers: offers, stats, roleBreakdown };
  }, [globalData, name]);

  if (!stats || companyOffers.length === 0) {
    return (
      <div className="page-container">
        <Link to="/explore" className="btn btn-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
          <ArrowLeft size={16} /> Back to Explore
        </Link>
        <div className="empty-state">
          <div className="empty-state-title">Company not found</div>
          <div className="empty-state-text">No offers found for this company.</div>
        </div>
      </div>
    );
  }

  const displayName = titleCase(decodeURIComponent(name));
  const isDark = theme !== 'light';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';

  // Salary band visualization percentages
  const bandMin = stats.min || 0;
  const bandMax = stats.max || 1;
  const bandRange = bandMax - bandMin || 1;
  const p25Pct = ((stats.p25 - bandMin) / bandRange) * 100;
  const medPct = ((stats.median - bandMin) / bandRange) * 100;
  const p75Pct = ((stats.p75 - bandMin) / bandRange) * 100;

  // Role chart data
  const roleChartData = {
    labels: roleBreakdown.slice(0, 10).map(r => r.name),
    datasets: [{
      label: 'Median Salary',
      data: roleBreakdown.slice(0, 10).map(r => r.median),
      backgroundColor: 'rgba(0, 212, 255, 0.3)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const roleChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => formatSalary(ctx.raw) },
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
      y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
    },
  };

  return (
    <div className="page-container">
      <Link to="/explore" className="btn btn-secondary" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      {/* Company Hero */}
      <div className="company-hero">
        <div className="company-hero-logo">
          <CompanyLogo name={displayName} size={56} />
        </div>
        <div className="company-hero-info">
          <h1>{displayName}</h1>
          <div className="company-hero-stats">
            <span><Briefcase size={14} /> {stats.offerCount} offers</span>
            <span><Users size={14} /> Avg {stats.avgYoe || '—'} YOE</span>
            <span><MapPin size={14} /> {stats.locations.slice(0, 3).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      {/* Salary Band */}
      {stats.salaryCount > 0 && (
        <div className="salary-band">
          <div className="salary-band-title">Salary Range</div>
          <div className="salary-band-bar">
            {/* P25-P75 interquartile range */}
            <div
              className="salary-band-fill"
              style={{
                left: `${p25Pct}%`,
                width: `${p75Pct - p25Pct}%`,
                background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.3), rgba(124, 92, 255, 0.3))',
              }}
            >
              Median: {formatSalary(stats.median)}
            </div>
          </div>
          <div className="salary-band-markers">
            <span>Min: {formatSalary(stats.min)}</span>
            <span>P25: {formatSalary(stats.p25)}</span>
            <span>P75: {formatSalary(stats.p75)}</span>
            <span>P90: {formatSalary(stats.p90)}</span>
            <span>Max: {formatSalary(stats.max)}</span>
          </div>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="summary-cards" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card card-stat">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatSalary(stats.median)}</div>
          <div className="stat-label">Median Comp</div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{formatSalary(stats.p75)}</div>
          <div className="stat-label">P75</div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{formatSalary(stats.p90)}</div>
          <div className="stat-label">P90</div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{stats.offerCount}</div>
          <div className="stat-label">Total Offers</div>
        </div>
      </div>

      {/* Role Breakdown Chart */}
      {roleBreakdown.length > 1 && (
        <div className="card card-chart" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 className="card-title">💼 Compensation by Role</h2>
          <div className="chart-wrapper" style={{ height: Math.max(200, roleBreakdown.slice(0, 10).length * 35) }}>
            <Bar data={roleChartData} options={roleChartOptions} />
          </div>
        </div>
      )}

      {/* All Offers */}
      <h2 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
        All Offers ({companyOffers.length})
      </h2>
      <div className="offer-cards-grid">
        {companyOffers.map((offer, i) => (
          <OfferCard
            key={offer.post_url || i}
            offer={offer}
            median={stats.median}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
