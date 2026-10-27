import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Clock,
  Users,
  Activity,
  Layers,
  PhoneIncoming,
  Mic,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { TelnyxCall, TelnyxAssistant } from '../types';
import {
  aggregateProductBreakdown,
  aggregateHourlyDistribution,
  ProductBreakdownItem,
} from '../utils/dashboardHelpers';

interface TelnyxAnalyticsGridProps {
  calls: TelnyxCall[];
  assistants: TelnyxAssistant[];
  timezone: string;
}

export const TelnyxAnalyticsGrid: React.FC<TelnyxAnalyticsGridProps> = ({
  calls,
  assistants,
  timezone,
}) => {
  const [activeView, setActiveView] = useState<'products' | 'hourly' | 'assistants'>('products');

  // Aggregated data
  const productBreakdown = useMemo(() => aggregateProductBreakdown(calls), [calls]);
  const hourlyData = useMemo(() => aggregateHourlyDistribution(calls, timezone), [calls, timezone]);

  const maxHourlyCount = useMemo(
    () => Math.max(...hourlyData.map((h) => h.count), 1),
    [hourlyData]
  );

  // Assistant metrics breakdown
  const assistantStats = useMemo(() => {
    return assistants.map((asst) => {
      const asstCalls = calls.filter((c) => c.assistant_id === asst.id);
      const totalMins = asstCalls.reduce((acc, c) => acc + c.billed_sec / 60, 0);
      const totalSpend = asstCalls.reduce((acc, c) => acc + (c.recorded_cost || 0), 0);
      const avgDurationSec =
        asstCalls.length > 0
          ? Math.round(
              asstCalls.reduce((acc, c) => acc + (c.duration_sec || c.billed_sec), 0) / asstCalls.length
            )
          : 0;

      return {
        id: asst.id,
        name: asst.name,
        clinicCode: asst.clinic_code,
        callCount: asstCalls.length,
        billedMinutes: totalMins,
        totalSpend,
        avgDurationSec,
        ratePerMin: totalMins > 0 ? totalSpend / totalMins : 0,
      };
    });
  }, [calls, assistants]);

  // Direction & recording metrics
  const inboundCount = calls.filter((c) => c.direction === 'inbound').length;
  const outboundCount = calls.filter((c) => c.direction === 'outbound').length;
  const recordedCount = calls.filter((c) =>
    c.charges.some((ch) => ch.service.toLowerCase().includes('recording'))
  ).length;

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3.5 sm:p-4 space-y-3.5 shadow-xs">
      {/* Header and View Selector matching theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-[#3b110c] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#8b372b] shrink-0" />
              <span>Telnyx API Telephony Intelligence &amp; Decomposition</span>
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8eed2] text-[#8b372b] font-bold border border-[#e2d7c3] shrink-0">
              Real-Time Feed
            </span>
          </div>
          <p className="text-[11px] text-[#5d3d3a]">
            Component cost distribution, hourly receptionist volume ({timezone}), and assistant operational metrics.
          </p>
        </div>

        {/* View Switcher styled with theme */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#faf8f2] border border-[#dcd3c1] text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveView('products')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'products'
                ? 'bg-[#ffffff] text-[#3b110c] font-bold shadow-2xs border border-[#dcd3c1]'
                : 'text-[#7d6360] hover:text-[#3b110c]'
            }`}
          >
            Product Breakdown
          </button>
          <button
            onClick={() => setActiveView('hourly')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'hourly'
                ? 'bg-[#ffffff] text-[#3b110c] font-bold shadow-2xs border border-[#dcd3c1]'
                : 'text-[#7d6360] hover:text-[#3b110c]'
            }`}
          >
            Hourly Activity
          </button>
          <button
            onClick={() => setActiveView('assistants')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'assistants'
                ? 'bg-[#ffffff] text-[#3b110c] font-bold shadow-2xs border border-[#dcd3c1]'
                : 'text-[#7d6360] hover:text-[#3b110c]'
            }`}
          >
            Clinic Comparison
          </button>
        </div>
      </div>

      {/* VIEW 1: PRODUCT BREAKDOWN */}
      {activeView === 'products' && (
        <div className="space-y-3">
          {/* Proportional Segmented Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#5d3d3a]">
              <span>Spend Share by Service Layer</span>
              <span className="font-bold text-[#3b110c]">
                ${productBreakdown.reduce((acc, p) => acc + p.cost, 0).toFixed(4)} Total
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#f0ebe0] border border-[#e7decb]">
              {productBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${Math.max(2, item.percentage)}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.name}: $${item.cost.toFixed(4)} (${item.percentage}%)`}
                  className="h-full transition-all hover:opacity-90"
                />
              ))}
            </div>
          </div>

          {/* Cards for each layer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-2.5 pt-1">
            {productBreakdown.map((item, idx) => {
              const effectiveRate = item.cost / (calls.reduce((acc, c) => acc + c.billed_sec / 60, 0) || 1);
              return (
                <div
                  key={idx}
                  className="min-w-0 p-2.5 rounded-lg bg-[#faf8f2] border border-[#ede5d5] flex flex-col justify-between space-y-1.5 text-xs shadow-2xs hover:border-[#d7ccb8] transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0" title={item.name}>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#3b110c] truncate text-[11px] sm:text-xs">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-1 min-w-0">
                    <span className="text-sm sm:text-base font-bold font-mono text-[#3b110c] tabular-nums truncate">
                      ${item.cost.toFixed(4)}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f3ede0] text-[#7d6360] font-medium shrink-0">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7d6360] pt-1 border-t border-[#ede5d5]/80 min-w-0">
                    <span className="text-[9px] text-[#9b8380] uppercase tracking-wider shrink-0">Rate</span>
                    <span className="font-medium text-[#5d3d3a] whitespace-nowrap tabular-nums">
                      {effectiveRate.toFixed(4)}/m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metadata banner */}
          <div className="p-2 rounded-lg bg-[#f8eed2]/50 border border-[#e5d9bd] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#5d3d3a]">
            <span>
              Inbound Calls: <strong className="text-[#3b110c]">{inboundCount}</strong> · Outbound: <strong className="text-[#3b110c]">{outboundCount}</strong>
            </span>
            <span>
              Call Recordings: <strong className="text-[#1f6f43]">{recordedCount} / {calls.length} legs</strong>
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: HOURLY ACTIVITY */}
      {activeView === 'hourly' && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono text-[#5d3d3a]">
            <span>Call Volume by Hour ({timezone})</span>
            <span className="text-[10px] text-[#7d6360]">Business hours typically 9a - 5p</span>
          </div>

          {/* 24-hour histogram */}
          <div className="h-32 flex items-end gap-1 w-full pt-4 pb-1 border-b border-[#ede5d5] px-1">
            {hourlyData.map((h, idx) => {
              const heightPct = Math.max(6, Math.round((h.count / maxHourlyCount) * 100));
              const isBusinessHour = h.hour >= 9 && h.hour <= 17;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center pointer-events-none z-20 whitespace-nowrap bg-[#3b110c] text-[#f8eed2] px-2 py-1 rounded text-[9px] font-mono shadow-md">
                    <span>
                      {h.label}: {h.count} calls (${h.cost.toFixed(4)})
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      h.count > 0
                        ? isBusinessHour
                          ? 'bg-[#8b372b] group-hover:bg-[#722b20]'
                          : 'bg-[#a05f1a] group-hover:bg-[#8b372b]'
                        : 'bg-[#e8dfce]/60'
                    }`}
                  />

                  {/* Hour label on alternate bars to prevent crowding */}
                  <span className="text-[8px] font-mono text-[#7d6360] mt-1">
                    {h.hour % 3 === 0 ? h.label : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#7d6360]">
            <span>12 AM (Midnight)</span>
            <span className="text-[#8b372b] font-bold">Peak Business Hours (9 AM – 5 PM)</span>
            <span>11 PM</span>
          </div>
        </div>
      )}

      {/* VIEW 3: CLINIC / ASSISTANT COMPARISON */}
      {activeView === 'assistants' && (
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#e7decb] bg-[#f8eed2]/70 text-[#3b110c] text-[10px] uppercase tracking-wider font-semibold">
                <th className="py-2 px-3 font-sans">Clinic Assistant</th>
                <th className="py-2 px-3 text-right">Calls</th>
                <th className="py-2 px-3 text-right">Billed Minutes</th>
                <th className="py-2 px-3 text-right">Avg Call Duration</th>
                <th className="py-2 px-3 text-right">Total Telnyx Spend</th>
                <th className="py-2 px-3 text-right">Effective Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d5]">
              {assistantStats.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf8f2] transition-colors">
                  <td className="py-2 px-3 font-sans">
                    <span className="font-bold text-[#3b110c] block">{item.name}</span>
                    <span className="text-[10px] text-[#7d6360] font-mono">{item.clinicCode}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#3b110c] tabular-nums">
                    {item.callCount}
                  </td>
                  <td className="py-2 px-3 text-right text-[#5d3d3a] tabular-nums">
                    {item.billedMinutes.toFixed(1)}m
                  </td>
                  <td className="py-2 px-3 text-right text-[#5d3d3a] tabular-nums">
                    {Math.floor(item.avgDurationSec / 60)}m {item.avgDurationSec % 60}s
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#8b372b] tabular-nums">
                    ${item.totalSpend.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#1f6f43] font-bold tabular-nums">
                    ${item.ratePerMin.toFixed(4)}/m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
