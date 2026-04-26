import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { useAnalytics } from '../hooks/useAnalytics';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { formatSalary, titleCase } from '../utils/formatters';
import SummaryCards from '../components/SummaryCards';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function TrendsPage() {
  const { data: globalData } = useData();
  const { theme } = useTheme();
  const offers = globalData?.offers || [];
  const analytics = useAnalytics(offers);

  const isDark = theme !== 'light';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';

  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(18, 18, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    titleColor: isDark ? '#e8e8f0' : '#162033',
    bodyColor: isDark ? 'rgba(232, 232, 240, 0.7)' : 'rgba(22, 32, 51, 0.7)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 10,
    titleFont: { family: 'Inter', weight: '600', size: 13 },
    bodyFont: { family: 'JetBrains Mono', size: 12 },
  };

  // 1. Compensation Trend (Median over time)
  const trendData = {
    labels: analytics.trends.map(t => t.label),
    datasets: [
      {
        label: 'Median',
        data: analytics.trends.map(t => t.median),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#00d4ff',
        borderWidth: 2,
      },
      {
        label: 'P75',
        data: analytics.trends.map(t => t.p75),
        borderColor: '#7c5cff',
        backgroundColor: 'rgba(124, 92, 255, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 1.5,
        borderDash: [5, 5],
      },
      {
        label: 'P90',
        data: analytics.trends.map(t => t.p90),
        borderColor: '#c74cff',
        backgroundColor: 'rgba(199, 76, 255, 0.03)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 1.5,
        borderDash: [2, 4],
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } },
      tooltip: {
        ...tooltipStyle,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${formatSalary(ctx.raw)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
    },
  };

  // 2. Volume trend (offers per month)
  const volumeData = {
    labels: analytics.trends.map(t => t.label),
    datasets: [{
      label: 'Offers',
      data: analytics.trends.map(t => t.count),
      backgroundColor: 'rgba(0, 212, 255, 0.25)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const volumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => `${ctx.raw} offers` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 }, stepSize: 1 } },
    },
  };

  // 3. Location insights - top locations by median
  const topLocations = analytics.byLocation
    .filter(l => l.salaryCount >= 2 && l.name !== 'Unknown')
    .slice(0, 12);

  const locationData = {
    labels: topLocations.map(l => l.name),
    datasets: [{
      label: 'Median Comp',
      data: topLocations.map(l => l.median),
      backgroundColor: topLocations.map((_, i) =>
        ['#00d4ff', '#7c5cff', '#c74cff', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#4ade80', '#e879f9', '#22d3ee'][i % 12] + '66'
      ),
      borderColor: topLocations.map((_, i) =>
        ['#00d4ff', '#7c5cff', '#c74cff', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#4ade80', '#e879f9', '#22d3ee'][i % 12]
      ),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const locationOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => `Median: ${formatSalary(ctx.raw)}` } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
      y: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
    },
  };

  // 4. Role comparison
  const topRoles = analytics.byRole
    .filter(r => r.salaryCount >= 2)
    .slice(0, 10);

  const roleData = {
    labels: topRoles.map(r => r.name),
    datasets: [
      {
        label: 'Median',
        data: topRoles.map(r => r.median),
        backgroundColor: 'rgba(0, 212, 255, 0.3)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'P75',
        data: topRoles.map(r => r.p75),
        backgroundColor: 'rgba(124, 92, 255, 0.3)',
        borderColor: '#7c5cff',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const roleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => `${ctx.dataset.label}: ${formatSalary(ctx.raw)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 10 }, maxRotation: 45 } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
    },
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Trends & Insights</h1>
      <p className="page-subtitle">
        Compensation trends over time across {offers.length} data points
      </p>

      {/* Global Summary */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <SummaryCards 
          summary={globalData?.summary} 
          currency={'INR'} 
          offers={offers} 
        />
      </div>

      {/* Charts Grid */}
      <div className="trends-grid">
        {/* Compensation Trend */}
        {analytics.trends.length > 1 && (
          <div className="trends-chart-card full-width">
            <h2 className="card-title">📈 Compensation Over Time</h2>
            <div className="chart-wrapper chart-wrapper-tall">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>
        )}

        {/* Volume */}
        {analytics.trends.length > 1 && (
          <div className="trends-chart-card">
            <h2 className="card-title">📊 Offer Volume Over Time</h2>
            <div className="chart-wrapper chart-wrapper-side">
              <Bar data={volumeData} options={volumeOptions} />
            </div>
          </div>
        )}

        {/* Location Insights */}
        {topLocations.length > 0 && (
          <div className="trends-chart-card">
            <h2 className="card-title">📍 Compensation by Location</h2>
            <div className="chart-wrapper" style={{ height: Math.max(200, topLocations.length * 30) }}>
              <Bar data={locationData} options={locationOptions} />
            </div>
          </div>
        )}

        {/* Role Comparison */}
        {topRoles.length > 1 && (
          <div className="trends-chart-card full-width">
            <h2 className="card-title">👔 Role Comparison (Median vs P75)</h2>
            <div className="chart-wrapper">
              <Bar data={roleData} options={roleOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
