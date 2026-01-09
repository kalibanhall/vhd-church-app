/**
 * SimpleChart - Composants de graphiques simples
 * Charts basiques sans dépendances externes lourdes
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React from 'react';

// ==================== BAR CHART ====================

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  horizontal?: boolean;
  maxValue?: number;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  horizontal = false,
  maxValue,
  className = '',
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const defaultColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
    '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
  ];

  if (horizontal) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || defaultColors[index % defaultColors.length];
          
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                {showValues && (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || defaultColors[index % defaultColors.length];
          
          return (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center" style={{ height: height - 30 }}>
                {showValues && (
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {item.value.toLocaleString()}
                  </span>
                )}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${percentage}%`,
                      backgroundColor: color,
                      minHeight: item.value > 0 ? '4px' : '0',
                    }}
                  />
                </div>
              </div>
              {showLabels && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-full">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== LINE CHART ====================

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  color?: string;
  fillColor?: string;
  showPoints?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function LineChart({
  data,
  height = 200,
  color = '#3B82F6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  showPoints = true,
  showLabels = true,
  showGrid = true,
  className = '',
}: LineChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  
  const width = 100;
  const chartHeight = height - 40;
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((item, index) => ({
    x: index * stepX,
    y: chartHeight - ((item.value - min) / range) * chartHeight,
    ...item,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {/* Grid */}
        {showGrid && (
          <g className="text-gray-200 dark:text-gray-700">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={chartHeight * ratio}
                x2={width}
                y2={chartHeight * ratio}
                stroke="currentColor"
                strokeDasharray="2"
              />
            ))}
          </g>
        )}

        {/* Area fill */}
        <path d={areaD} fill={fillColor} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {showPoints &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
          ))}
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 dark:text-gray-400"
              style={{ width: `${100 / data.length}%`, textAlign: 'center' }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== DONUT CHART ====================

export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  showCenter?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  showLegend = true,
  showCenter = true,
  centerLabel,
  centerValue,
  className = '',
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const defaultColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
    '#06B6D4', '#EC4899', '#6366F1',
  ];

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentOffset = 0;

  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeDasharray = (percentage / 100) * circumference;
    const strokeDashoffset = -currentOffset;
    currentOffset += strokeDasharray;

    return {
      ...item,
      percentage,
      strokeDasharray: `${strokeDasharray} ${circumference}`,
      strokeDashoffset,
      color: item.color || defaultColors[index % defaultColors.length],
    };
  });

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />
          
          {/* Segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          ))}
        </svg>

        {/* Center content */}
        {showCenter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof centerValue === 'number'
                  ? centerValue.toLocaleString()
                  : centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {segment.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {segment.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SimpleCharts = { BarChart, LineChart, DonutChart };
export default SimpleCharts;
