'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { brand } from '@/lib/brand';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DistributionData {
  promoters: number;
  passives: number;
  detractors: number;
}

interface DistributionChartProps {
  data: DistributionData;
  className?: string;
}

export default function DistributionChart({ data, className = '' }: DistributionChartProps) {
  const total = data.promoters + data.passives + data.detractors;
  
  const chartData = {
    labels: ['Detractors (0-6)', 'Passives (7-8)', 'Promoters (9-10)'],
    datasets: [
      {
        label: 'Count',
        data: [data.detractors, data.passives, data.promoters],
        backgroundColor: [
          brand.danger,
          brand.warning,
          brand.success,
        ],
        borderColor: [
          brand.danger,
          brand.warning,
          brand.success,
        ],
        borderWidth: 1,
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
        text: 'Score Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: brand.text,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(tooltipItem: TooltipItem<'bar'>) {
            const percentage = total > 0 ? (((tooltipItem.raw as number) / total) * 100).toFixed(1) : '0';
            return `${percentage}% of responses`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: brand.tintLight,
        },
        ticks: {
          color: brand.text,
          precision: 0,
        },
        title: {
          display: true,
          text: 'Number of Responses',
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
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg" style={{ backgroundColor: brand.danger + '10' }}>
          <div className="text-2xl font-bold" style={{ color: brand.danger }}>
            {data.detractors}
          </div>
          <div className="text-sm text-gray-600">Detractors</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: brand.warning + '10' }}>
          <div className="text-2xl font-bold" style={{ color: brand.warning }}>
            {data.passives}
          </div>
          <div className="text-sm text-gray-600">Passives</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: brand.success + '10' }}>
          <div className="text-2xl font-bold" style={{ color: brand.success }}>
            {data.promoters}
          </div>
          <div className="text-sm text-gray-600">Promoters</div>
        </div>
      </div>
    </div>
  );
}
