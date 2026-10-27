import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Maximize2,
  TrendingUp,
} from 'lucide-react';
import { DailyUsageRow } from '../types';

interface DailyComboChartProps {
  daily: DailyUsageRow[];
}

export const DailyComboChart: React.FC<DailyComboChartProps> = ({ daily }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showCallCountLabels, setShowCallCountLabels] = useState(true);

  // Compute domains
  const maxMinutes = useMemo(() => {
    const highest = Math.max(...daily.map((d) => d.billed_sec / 60), 1);
    return Math.ceil(highest / 5) * 5 + 5; // round up to nice tick
  }, [daily]);

  const maxCost = useMemo(() => {
    const highest = Math.max(...daily.map((d) => d.recorded_cost || 0), 0.1);
    return Math.ceil(highest * 2) / 2 + 0.2; // round up
  }, [daily]);

  // Chart layout dimensions
  const chartHeight = 220;
  const padding = { top: 28, right: 48, bottom: 36, left: 44 };
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const colWidth = 36;
  const totalChartWidth = Math.max(760, daily.length * colWidth + padding.left + padding.right);
  const innerWidth = totalChartWidth - padding.left - padding.right;

  // Coordinate scales
  const getX = (index: number) => {
    const step = innerWidth / Math.max(1, daily.length);
    return padding.left + index * step + step / 2;
  };

  const getYMinutes = (minutes: number) => {
    const clamped = Math.max(0, Math.min(minutes, maxMinutes));
    return padding.top + innerHeight - (clamped / maxMinutes) * innerHeight;
  };

  const getYCost = (cost: number) => {
    const clamped = Math.max(0, Math.min(cost, maxCost));
    return padding.top + innerHeight - (clamped / maxCost) * innerHeight;
  };

  // Generate SVG path for cost line
  const linePath = useMemo(() => {
    if (daily.length === 0) return '';
    return daily
      .map((day, idx) => {
        const x = getX(idx);
        const y = getYCost(day.recorded_cost || 0);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [daily, innerWidth, maxCost]);

  // Generate area fill under line for subtle aesthetic depth
  const areaPath = useMemo(() => {
    if (daily.length === 0) return '';
    const points = daily.map((day, idx) => {
      const x = getX(idx);
      const y = getYCost(day.recorded_cost || 0);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    const lastX = getX(daily.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + innerHeight;
    return `${points.join(' ')} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [daily, innerWidth, maxCost]);

  // Y-axis ticks
  const minuteTicks = [0, maxMinutes * 0.25, maxMinutes * 0.5, maxMinutes * 0.75, maxMinutes];
  const costTicks = [0, maxCost * 0.25, maxCost * 0.5, maxCost * 0.75, maxCost];

  const totalMonthMinutes = useMemo(
    () => daily.reduce((acc, d) => acc + d.billed_sec / 60, 0),
    [daily]
  );
  const totalMonthCost = useMemo(
    () => daily.reduce((acc, d) => acc + (d.recorded_cost || 0), 0),
    [daily]
  );
  const totalCalls = useMemo(
    () => daily.reduce((acc, d) => acc + d.call_count, 0),
    [daily]
  );

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3.5 sm:p-4 space-y-3 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#3b110c] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#8b372b]" />
              Daily Telephony Consumption: Call Minutes & Cost
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f8eed2] text-[#8b372b] font-bold border border-[#e2d7c3]">
              Combo Chart
            </span>
          </div>
          <p className="text-[11px] text-[#5d3d3a]">
            Call minutes represented as bars; recorded cost ($) shown as synchronized line. Horizontal scroll enabled.
          </p>
        </div>

        {/* Legend & Stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-[#5d3d3a]">
            <span className="inline-block w-3 h-3 rounded-xs bg-[#8b372b]"></span>
            <span>Billed Mins (Bars)</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#3b110c] font-semibold">
            <span className="inline-block w-3 h-0.5 bg-[#3b110c]"></span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3b110c] -ml-2"></span>
            <span>Cost $ (Line)</span>
          </div>

          <button
            onClick={() => setShowCallCountLabels(!showCallCountLabels)}
            className="px-2 py-0.5 text-[10px] rounded border border-[#dcd3c1] bg-[#faf8f2] text-[#5d3d3a] hover:text-[#3b110c] cursor-pointer"
          >
            {showCallCountLabels ? 'Hide Call Counts' : 'Show Call Counts'}
          </button>
        </div>
      </div>

      {/* Quick summary strip */}
      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#faf8f2] border border-[#ede5d5] text-xs font-mono">
        <div>
          <span className="text-[#7d6360] text-[10px] block">OCTOBER MINUTES</span>
          <span className="text-[#3b110c] font-bold text-xs sm:text-sm tabular-nums">
            {totalMonthMinutes.toFixed(1)} mins
          </span>
        </div>
        <div>
          <span className="text-[#7d6360] text-[10px] block">TOTAL CALLS</span>
          <span className="text-[#8b372b] font-bold text-xs sm:text-sm tabular-nums">
            {totalCalls} calls
          </span>
        </div>
        <div>
          <span className="text-[#7d6360] text-[10px] block">RECORDED SPEND</span>
          <span className="text-[#1f6f43] font-bold text-xs sm:text-sm tabular-nums">
            ${totalMonthCost.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Scrollable Chart Viewport Container */}
      <div className="relative border border-[#ede5d5] rounded-lg bg-[#fcfaf7] overflow-hidden">
        {/* Scroll hint badge on mobile */}
        <div className="sm:hidden px-2.5 py-1 text-[10px] font-mono text-[#7d6360] bg-[#f8eed2]/50 border-b border-[#ede5d5] flex items-center justify-between">
          <span>&larr; Scroll horizontally to view all October days &rarr;</span>
          <span className="font-bold text-[#8b372b]">{daily.length} days</span>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#d4caa8] p-1">
          <div style={{ width: `${totalChartWidth}px`, minWidth: '760px' }} className="relative">
            <svg
              width={totalChartWidth}
              height={chartHeight}
              className="overflow-visible select-none"
            >
              <defs>
                {/* Gradient for minutes bars */}
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b372b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a05f1a" stopOpacity="0.75" />
                </linearGradient>

                {/* Gradient for hover bar */}
                <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#722b20" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b372b" stopOpacity="0.9" />
                </linearGradient>

                {/* Gradient for subtle area under cost line */}
                <linearGradient id="costAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b110c" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#3b110c" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {minuteTicks.map((tick, i) => {
                const y = getYMinutes(tick);
                return (
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={totalChartWidth - padding.right}
                      y2={y}
                      stroke="#ede5d5"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    {/* Left Axis: Minutes */}
                    <text
                      x={padding.left - 6}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#7d6360"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {Math.round(tick)}m
                    </text>
                    {/* Right Axis: Cost $ */}
                    <text
                      x={totalChartWidth - padding.right + 6}
                      y={y + 3.5}
                      textAnchor="start"
                      fill="#3b110c"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      ${costTicks[i]?.toFixed(2) ?? '0.00'}
                    </text>
                  </g>
                );
              })}

              {/* Area under cost line */}
              <path d={areaPath} fill="url(#costAreaGradient)" />

              {/* Bars: Call Minutes */}
              {daily.map((day, idx) => {
                const x = getX(idx);
                const mins = day.billed_sec / 60;
                const barY = getYMinutes(mins);
                const barHeight = Math.max(3, padding.top + innerHeight - barY);
                const barWidth = 14;
                const isHovered = hoveredIdx === idx;

                return (
                  <g
                    key={`bar-${idx}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Invisible wider hover hit target */}
                    <rect
                      x={x - colWidth / 2}
                      y={padding.top}
                      width={colWidth}
                      height={innerHeight + padding.bottom}
                      fill={isHovered ? 'rgba(139, 55, 43, 0.05)' : 'transparent'}
                    />

                    {/* Bar rectangle */}
                    <rect
                      x={x - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="2.5"
                      fill={isHovered ? 'url(#barHoverGradient)' : 'url(#barGradient)'}
                      className="transition-colors"
                    />

                    {/* Optional call count label above bar */}
                    {showCallCountLabels && day.call_count > 0 && (
                      <text
                        x={x}
                        y={barY - 4}
                        textAnchor="middle"
                        fill="#8b372b"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        {day.call_count}c
                      </text>
                    )}

                    {/* Date label at bottom */}
                    <text
                      x={x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fill={isHovered ? '#3b110c' : '#7d6360'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {day.date.replace('Oct ', '')}
                    </text>
                  </g>
                );
              })}

              {/* Line: Recorded Cost $ */}
              <path
                d={linePath}
                fill="none"
                stroke="#3b110c"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points on Cost Line */}
              {daily.map((day, idx) => {
                const x = getX(idx);
                const y = getYCost(day.recorded_cost || 0);
                const isHovered = hoveredIdx === idx;

                return (
                  <g
                    key={`point-${idx}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill="#f8eed2"
                      stroke="#3b110c"
                      strokeWidth={isHovered ? 2.5 : 1.8}
                    />
                  </g>
                );
              })}

              {/* Active hover crosshair */}
              {hoveredIdx !== null && daily[hoveredIdx] && (
                <g>
                  <line
                    x1={getX(hoveredIdx)}
                    y1={padding.top}
                    x2={getX(hoveredIdx)}
                    y2={padding.top + innerHeight}
                    stroke="#8b372b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </g>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && daily[hoveredIdx] && (
              <div
                style={{
                  left: `${Math.min(
                    totalChartWidth - 170,
                    Math.max(10, getX(hoveredIdx) - 80)
                  )}px`,
                  top: '12px',
                }}
                className="absolute z-20 pointer-events-none p-2 rounded-lg bg-[#3b110c] text-[#f8eed2] text-[10px] font-mono shadow-xl border border-[#5d3d3a] space-y-0.5 whitespace-nowrap"
              >
                <div className="font-bold text-white border-b border-[#5d3d3a] pb-0.5">
                  {daily[hoveredIdx].date}, 2026
                </div>
                <div className="flex justify-between gap-3 text-[#f8eed2]">
                  <span>Billed Duration:</span>
                  <span className="font-bold text-white">
                    {(daily[hoveredIdx].billed_sec / 60).toFixed(1)} mins
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-[#f8eed2]">
                  <span>Call Volume:</span>
                  <span className="font-bold text-[#e9e4a6]">
                    {daily[hoveredIdx].call_count} calls
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-[#f8eed2]">
                  <span>Telnyx Spend:</span>
                  <span className="font-bold text-[#f8eed2]">
                    ${(daily[hoveredIdx].recorded_cost || 0).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-[#bdb7fc]">
                  <span>Effective Rate:</span>
                  <span>${(daily[hoveredIdx].cost_per_minute || 0).toFixed(4)}/min</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom axis descriptor footer */}
        <div className="px-3 py-1.5 bg-[#faf8f2] border-t border-[#ede5d5] flex items-center justify-between text-[10px] font-mono text-[#5d3d3a]">
          <span className="flex items-center gap-1">
            <span className="font-bold text-[#8b372b]">Left Axis:</span> Billed Duration (Minutes)
          </span>
          <span className="text-[#7d6360]">Calendar Days in October 2026</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-[#3b110c]">Right Axis:</span> Recorded Cost ($)
          </span>
        </div>
      </div>
    </div>
  );
};
