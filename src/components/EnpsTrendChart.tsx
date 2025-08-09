'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { brand } from '@/lib/brand';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendDataPoint {
  month: string;
  enpsScore: number;
  responseCount: number;
}

interface EnpsTrendChartProps {
  data: TrendDataPoint[];
  className?: string;
}

export default function EnpsTrendChart({ data, className = '' }: EnpsTrendChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'eNPS Score',
        data: data.map(d => d.enpsScore),
        borderColor: brand.primary,
        backgroundColor: brand.primary + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: brand.primary,
        pointBorderColor: brand.bg,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'eNPS Trend (Last 12 Months)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: brand.text,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(tooltipItem: TooltipItem<'line'>) {
            const dataPoint = data[tooltipItem.dataIndex];
            return `Responses: ${dataPoint.responseCount}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: -100,
        max: 100,
        grid: {
          color: brand.tintLight,
        },
        ticks: {
          color: brand.text,
          callback: function(value: number | string) {
            return value + '';
          },
        },
        title: {
          display: true,
          text: 'eNPS Score',
          color: brand.text,
        },
      },
      x: {
        grid: {
          color: brand.tintLight,
        },
        ticks: {
          color: brand.text,
        },
      },
    },
  };

  return (
    <div className={`${className}`}>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
