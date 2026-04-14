import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { formatSalary, titleCase } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_COLORS = [
  '#00d4ff', '#7c5cff', '#c74cff', '#34d399', '#fbbf24',
  '#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#4ade80',
  '#e879f9', '#22d3ee', '#f472b6', '#818cf8', '#facc15',
];

export default function TopCompaniesChart({ companies, theme }) {
  if (!companies || companies.length === 0) return null;

  const top = companies
    .filter(c => c.avg_salary != null && c.salary_data_points >= 1)
    .slice(0, 15);

  const data = {
    labels: top.map(c => titleCase(c.company_normalized)),
    datasets: [{
      label: 'Avg Compensation',
      data: top.map(c => c.avg_salary),
      backgroundColor: top.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + '88'),
      borderColor: top.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const isDark = theme !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Avg: ${formatSalary(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="card card-chart card-chart-side">
      <h2 className="card-title">🏆 Top Paying Companies</h2>
      <div className="chart-wrapper chart-wrapper-side">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
