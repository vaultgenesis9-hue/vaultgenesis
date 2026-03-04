import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  isDark: boolean;
  data: Candle[];
}

export default function CandlestickChart({ isDark, data }: CandlestickChartProps) {
  const chartRef = useRef(null);

  // Generate chart data from candlesticks
  const chartData = {
    labels: data.map((_, i) => `${i}`),
    datasets: [
      {
        label: 'Price',
        data: data.map(candle => candle.close),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'High',
        data: data.map(candle => candle.high),
        borderColor: '#22c55e',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
      {
        label: 'Low',
        data: data.map(candle => candle.low),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? '#d1d5db' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          color: isDark ? '#1f2937' : '#e5e7eb',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
      x: {
        grid: {
          color: isDark ? '#1f2937' : '#e5e7eb',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  return (
    <div className="w-full h-full" style={{ minHeight: '200px', position: 'relative' }}>
      <Line ref={chartRef} data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
