import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { formatSalary } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DistributionChart({ offers, theme }) {
  if (!offers || offers.length === 0) return null;

  const validSalaries = offers.map(o => o.total).filter(t => t != null);
  if (validSalaries.length === 0) return null;
  
  const min = Math.min(...validSalaries);
  const max = Math.max(...validSalaries);
  const binCount = 20;
  const binSize = (max - min) / binCount;
  
  const bins = new Array(binCount).fill(0);
  validSalaries.forEach(s => {
    let idx = Math.floor((s - min) / binSize);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx]++;
  });

  const labels = bins.map((_, i) => `${formatSalary(min + i * binSize)}`);

  const data = {
    labels,
    datasets: [{
      label: 'Number of Offers',
      data: bins,
      backgroundColor: '#7c5cff44',
      borderColor: '#7c5cff',
      borderWidth: 1,
      borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
      barPercentage: 1.0,
      categoryPercentage: 1.0,
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
          title: ctx => {
            const i = ctx[0].dataIndex;
            const start = min + i * binSize;
            const end = start + binSize;
            return `${formatSalary(start)} - ${formatSalary(end)}`;
          },
          label: ctx => `${ctx.raw} offers`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 }, stepSize: 1 },
      },
    },
  };

  return (
    <div className="card card-chart card-chart-side">
      <h2 className="card-title">📊 Compensation Distribution</h2>
      <div className="chart-wrapper chart-wrapper-side">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
