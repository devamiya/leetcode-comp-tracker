import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { formatSalary } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_COLORS = [
  '#00d4ff', '#7c5cff', '#c74cff', '#34d399', '#fbbf24',
  '#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#4ade80',
  '#e879f9', '#22d3ee', '#f472b6', '#818cf8', '#facc15',
];

export default function RolesChart({ roles, theme }) {
  if (!roles || roles.length === 0) return null;

  const topRoles = roles
    .filter(r => r.avg_salary != null && r.offer_count >= 1)
    .slice(0, 12);

  const data = {
    labels: topRoles.map(r => r.role_normalized),
    datasets: [{
      label: 'Avg Salary',
      data: topRoles.map(r => r.avg_salary),
      backgroundColor: topRoles.map((_, i) => CHART_COLORS[(i + 3) % CHART_COLORS.length] + '77'),
      borderColor: topRoles.map((_, i) => CHART_COLORS[(i + 3) % CHART_COLORS.length]),
      borderWidth: 1,
      borderRadius: 6,
    }, {
      label: 'Median Salary',
      data: topRoles.map(r => r.median_salary),
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const isDark = theme !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${formatSalary(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Inter', size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  };

  return (
    <div className="card card-chart card-chart-side">
      <h2 className="card-title">👔 Compensation by Role</h2>
      <div className="chart-wrapper chart-wrapper-side">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
