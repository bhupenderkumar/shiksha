import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: number[];
  labels: string[];
  label: string;
  color?: string;
  fill?: boolean;
}

export function LineChart({ data, labels, label, color = 'rgb(59, 130, 246)', fill = true }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(255, 255, 255)',
        titleColor: 'rgb(0, 0, 0)',
        bodyColor: 'rgb(0, 0, 0)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return `${label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgb(243, 244, 246)',
        },
        ticks: {
          font: {
            size: 12,
          },
          color: 'rgb(107, 114, 128)',
          callback: function(value: any) {
            return value + (label.toLowerCase().includes('percentage') ? '%' : '');
          }
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: fill 
          ? `${color.replace(')', ', 0.1)')}` 
          : 'transparent',
        fill,
        pointBackgroundColor: color,
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full h-[300px] p-4">
      <Line options={options} data={chartData} />
    </div>
  );
}
