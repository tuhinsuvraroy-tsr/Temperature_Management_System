import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { generateChartDatasets } from '../utils/helper';

// Register Chart.js components once
ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

// Chart options — styling only, dataset generation logic is untouched
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255,255,255,0.78)',
        font: { family: "'Outfit', sans-serif", size: 12, weight: '400' },
        padding: 22,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(4, 9, 26, 0.90)',
      titleColor: 'rgba(255,255,255,0.95)',
      bodyColor: 'rgba(255,255,255,0.72)',
      borderColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      padding: 13,
      cornerRadius: 12,
      titleFont: { family: "'Outfit', sans-serif", size: 13, weight: '500' },
      bodyFont: { family: "'Outfit', sans-serif", size: 12 },
      callbacks: {
        label: (ctx) => `  ${ctx.dataset.label}: ${ctx.parsed.y}°C`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
      ticks: {
        color: 'rgba(255,255,255,0.58)',
        font: { family: "'Outfit', sans-serif", size: 11 },
        maxTicksLimit: 8,
      },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
      ticks: {
        color: 'rgba(255,255,255,0.58)',
        font: { family: "'Outfit', sans-serif", size: 11 },
        callback: (v) => `${v}°`,
        padding: 8,
      },
      border: { display: false },
    },
  },
};

function HistoryChart({ locations }) {
  const chartData = useMemo(() => generateChartDatasets(locations), []);

  return (
    <section className="history-section">
      <div className="glass-card">
        <p className="section-label">Previous Day · Hourly Temperature</p>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </section>
  );
}

export default HistoryChart;
