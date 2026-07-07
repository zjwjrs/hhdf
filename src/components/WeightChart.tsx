import React, { useState } from 'react';
import { WeightLog } from '../types';
import { TrendingDown, Info, Calendar } from 'lucide-react';

interface WeightChartProps {
  logs: WeightLog[];
}

export default function WeightChart({ logs }: WeightChartProps) {
  const [filterType, setFilterType] = useState<'seven' | 'all'>('seven');

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs h-[280px] flex flex-col items-center justify-center">
        <Info size={32} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-400 font-sans font-medium">暂时没有体重记录，无法生成趋势图</p>
      </div>
    );
  }

  // Filter logs chronologically (oldest to newest for plotting left-to-right)
  const sortedChronologically = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = filterType === 'seven' 
    ? sortedChronologically.slice(-7) 
    : sortedChronologically;

  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs h-[280px] flex flex-col items-center justify-center">
        <div className="p-3 bg-rose-50 rounded-2xl text-rose-400 mb-3 animate-pulse">
          <TrendingDown size={24} />
        </div>
        <p className="text-sm text-gray-500 font-sans font-semibold mb-1">趋势生成中...</p>
        <p className="text-xs text-gray-400 font-sans text-center max-w-[200px]">
          需要至少记录 2 天的体重才能绘制精美折线图哦！
        </p>
      </div>
    );
  }

  // Calculate scales
  const weights = chartData.map(d => d.weight);
  const maxWeight = Math.max(...weights) + 0.5;
  const minWeight = Math.max(20, Math.min(...weights) - 0.5); // Ensure scale has some floor
  const weightRange = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;

  // SVG parameters
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const getCoordinates = () => {
    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * (width - paddingX * 2);
      // Invert Y because SVG coordinates start from top-left (0,0)
      const y = height - paddingY - ((d.weight - minWeight) / weightRange) * (height - paddingY * 2);
      return { x, y, log: d };
    });
  };

  const coords = getCoordinates();

  // Build path strings
  let linePath = '';
  let areaPath = '';

  if (coords.length > 0) {
    // 1. Core Line Path
    linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Use cubic bezier curves or straight lines. Straight lines are incredibly robust.
      linePath += ` L ${coords[i].x} ${coords[i].y}`;
    }

    // 2. Closed Area Path for gradient fill
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;
  }

  // Grid line values
  const gridLinesCount = 3;
  const gridLines = [];
  for (let i = 0; i <= gridLinesCount; i++) {
    const val = minWeight + (i / gridLinesCount) * weightRange;
    const y = height - paddingY - (i / gridLinesCount) * (height - paddingY * 2);
    gridLines.push({ val, y });
  }

  return (
    <div id="trend-analysis-card" className="bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-sans font-semibold text-gray-800 tracking-tight text-base">体重趋势曲线</h3>
          <p className="text-[11px] text-gray-400 font-sans">直观查看体重下行轨迹与纤体成效</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            id="chart-filter-seven-btn"
            onClick={() => setFilterType('seven')}
            className={`text-xs px-2.5 py-1 rounded-lg font-sans font-semibold transition-all ${
              filterType === 'seven' 
                ? 'bg-white text-rose-500 shadow-xs' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            最近 7 次
          </button>
          <button
            id="chart-filter-all-btn"
            onClick={() => setFilterType('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-sans font-semibold transition-all ${
              filterType === 'all' 
                ? 'bg-white text-rose-500 shadow-xs' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            全部记录 ({logs.length})
          </button>
        </div>
      </div>

      {/* Custom responsive SVG chart */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B81" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF6B81" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFA2B0" />
              <stop offset="50%" stopColor="#FF6B81" />
              <stop offset="100%" stopColor="#FF4757" />
            </linearGradient>
          </defs>

          {/* Grid lines & left labels */}
          {gridLines.map((line, idx) => (
            <g key={`grid-${idx}`}>
              <line 
                x1={paddingX} 
                y1={line.y} 
                x2={width - paddingX} 
                y2={line.y} 
                stroke="#F1F2F6" 
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text 
                x={paddingX - 8} 
                y={line.y + 3} 
                textAnchor="end" 
                className="font-sans text-[10px] font-bold fill-gray-400"
              >
                {line.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area under curve */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {/* Main trend line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGradient)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Coordinate node circles & weight numbers above them */}
          {coords.map((coord, idx) => {
            const displayDate = coord.log.date.substring(5); // MM-DD
            return (
              <g key={`node-${idx}`} className="group cursor-pointer">
                {/* Invisible larger hover circle */}
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r="14" 
                  fill="transparent" 
                />
                {/* Solid core circle */}
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r="5.5" 
                  className="fill-rose-500 stroke-white stroke-2 transition-all duration-200 group-hover:r-[7.5] group-hover:fill-rose-600"
                />
                
                {/* Weight value above node */}
                <text 
                  x={coord.x} 
                  y={coord.y - 10} 
                  textAnchor="middle" 
                  className="font-sans text-[10px] font-extrabold fill-rose-600 bg-white"
                >
                  {coord.log.weight.toFixed(1)}
                </text>

                {/* X-axis date labels */}
                <text 
                  x={coord.x} 
                  y={height - 6} 
                  textAnchor="middle" 
                  className="font-sans text-[9px] font-bold fill-gray-400 group-hover:fill-gray-700 transition-colors"
                >
                  {displayDate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 font-sans border-t border-gray-50 pt-3">
        <span>统计周期: {chartData[0].date} ~ {chartData[chartData.length - 1].date}</span>
        <span className="flex items-center gap-1 text-rose-400 font-medium">
          <Calendar size={12} />
          <span>最新记录: {chartData[chartData.length - 1].weight.toFixed(1)} kg</span>
        </span>
      </div>
    </div>
  );
}
