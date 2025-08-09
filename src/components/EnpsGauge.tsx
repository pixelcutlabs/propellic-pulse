'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getENPSColor } from '@/lib/enps';
import { brand } from '@/lib/brand';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EnpsGaugeProps {
  enpsScore: number;
  className?: string;
}

export default function EnpsGauge({ enpsScore, className = '' }: EnpsGaugeProps) {
  const normalizedScore = Math.max(-100, Math.min(100, enpsScore));
  const gaugeValue = (normalizedScore + 100) / 2; // Convert -100/100 to 0/100
  
  const data = {
    datasets: [
      {
        data: [gaugeValue, 100 - gaugeValue],
        backgroundColor: [
          getENPSColor(enpsScore),
          brand.tintLight,
        ],
        borderColor: [
          getENPSColor(enpsScore),
          brand.tintLight,
        ],
        borderWidth: 0,
        cutout: '75%',
        rotation: 270,
        circumference: 180,
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
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className={`relative ${className}`}>
      <div className="h-48 w-96">
        <Doughnut data={data} options={options} />
      </div>
      
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <div 
          className="text-4xl font-bold"
          style={{ color: getENPSColor(enpsScore) }}
        >
          {enpsScore}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          eNPS Score
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {enpsScore >= 50 ? 'Excellent' : 
           enpsScore >= 0 ? 'Good' : 
           'Needs Improvement'}
        </div>
      </div>
    </div>
  );
}
