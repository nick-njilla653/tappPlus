'use client';

import { useState, useEffect } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  type: 'bar' | 'line' | 'pie';
  title?: string;
  className?: string;
  height?: number;
}

export function SimpleChart({ 
  data, 
  type, 
  title, 
  className = '', 
  height = 200 
}: SimpleChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
  ];

  const renderBarChart = () => (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="h-6 rounded-full flex items-center justify-end pr-2"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || colors[index % colors.length],
              }}
            >
              <span className="text-xs text-white font-medium">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 100,
    }));

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="#3B82F6"
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index} className="truncate">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex items-center space-x-6">
        <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            className="transform -rotate-90"
          >
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`,
              ].join(' ');

              cumulativePercentage += percentage;

              return (
                <path
                  key={item.label}
                  d={pathData}
                  fill={item.color || colors[index % colors.length]}
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">
                {item.label}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
      )}
      <div style={{ minHeight: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
}
