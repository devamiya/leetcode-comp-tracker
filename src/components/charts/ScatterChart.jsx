import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { formatSalary } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function ScatterChart({ offers, theme }) {
  if (!offers || offers.length === 0) return null;

  const points = offers
    .filter(o => o.yoe != null && o.total != null)
    .map(o => ({ x: o.yoe, y: o.total, company: o.company, role: o.role }));

  const data = {
    datasets: [{
      label: 'Offers',
      data: points,
      backgroundColor: '#00d4ff44',
      borderColor: '#00d4ff',
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#00d4ff',
    }],
  };

  const isDark = theme !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';
  const textColor = isDark ? 'rgba(232, 232, 240, 0.55)' : 'rgba(22, 32, 51, 0.68)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const p = ctx.raw;
            return [
              `${p.company || '?'} — ${p.role || '?'}`,
              `YOE: ${p.x}  |  Total: ${formatSalary(p.y)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Years of Experience', color: textColor, font: { family: 'Inter', size: 12 } },
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        title: { display: true, text: 'Total Compensation', color: textColor, font: { family: 'Inter', size: 12 } },
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  };

  return (
    <div className="card card-chart card-chart-side">
      <h2 className="card-title">📈 YOE vs Total Compensation</h2>
      <div className="chart-wrapper chart-wrapper-side">
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
