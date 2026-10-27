import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  PhoneCall,
  Activity,
  Layers,
  Scale,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { DiscrepancyCard } from './DiscrepancyCard';
import { PerMinuteMetricsCard } from './PerMinuteMetricsCard';
import {
  TelnyxCall,
  DashboardMetrics,
  ActiveTab,
  TelnyxAssistant,
} from '../types';

interface OverviewViewProps {
  metrics: DashboardMetrics;
  calls: TelnyxCall[];
  assistants: TelnyxAssistant[];
  selectedAssistant: TelnyxAssistant | null;
  onSelectCall: (call: TelnyxCall) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  calls,
  assistants,
  selectedAssistant,
  onSelectCall,
  onNavigateTab,
}) => {
  const [activeChartMode, setActiveChartMode] = useState<'minutes' | 'cost'>('minutes');

  const { kpis, discrepancy, services, daily } = metrics;
  const maxDailyMinutes = Math.max(...daily.map((d) => d.billed_sec / 60), 1);
  const maxDailyCost = Math.max(...daily.map((d) => d.recorded_cost || 0), 1);

  return (
    <div className="space-y-6">
      {/* Overview Top Header: Admin Console & Assistant Context in Light Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7decb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b110c] bg-[#f8eed2] px-2 py-0.5 rounded border border-[#e2d7c3] font-bold">
              Telnyx Operations Console
            </span>
            <span className="text-xs text-[#5d3d3a] font-mono font-medium">
              Live API Sync · Real Telephony Data
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3b110c]">
            {selectedAssistant ? selectedAssistant.name : 'All Telnyx Voice Assistants'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5d3d3a]">
            {selectedAssistant
              ? `Telnyx Assistant ID: ${selectedAssistant.telnyx_assistant_id} · Number: ${selectedAssistant.number}`
              : `Aggregating ${assistants.length} production clinic receptionists`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigateTab('reconciliation')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#fdf8f7] hover:bg-[#fdeeed] text-[#8b372b] border border-[#f0c2bd] transition-colors cursor-pointer shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Audit Cost Discrepancy &rarr;</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Strip (Focus on Per-Minute Cost) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Blended Rate / Minute"
          value={`$${(kpis.blended_cost_per_minute || 0.0780).toFixed(4)}`}
          unit="/ min"
          subValue="Calculated from billed secs"
          highlight={true}
          icon={<DollarSign className="w-4 h-4 text-[#8b372b]" />}
          tooltip="Total recorded cost divided by exact Telnyx billed minutes"
        />

        <MetricCard
          label="Total Billed Minutes"
          value={kpis.billed_minutes.toFixed(1)}
          unit="mins"
          subValue={`${(kpis.billed_sec / 3600).toFixed(1)} billed hours`}
          icon={<Clock className="w-4 h-4 text-[#3b110c]" />}
          tooltip="Total billed duration reported across all Telnyx voice assistant legs"
        />

        <MetricCard
          label="Sum of Call Charges"
          value={kpis.recorded_cost !== null ? `$${kpis.recorded_cost.toFixed(4)}` : 'Pending'}
          subValue={`${kpis.complete_call_count} complete calls`}
          icon={<Activity className="w-4 h-4 text-[#1f6f43]" />}
          tooltip="Total recorded cost summed from all individual priced charge records"
        />

        <MetricCard
          label="Telnyx Session Total"
          value={kpis.telnyx_session_total_cost !== null ? `$${kpis.telnyx_session_total_cost.toFixed(4)}` : 'Pending'}
          subValue={`Delta: ${discrepancy.delta >= 0 ? `+$${discrepancy.delta.toFixed(4)}` : `-$${Math.abs(discrepancy.delta).toFixed(4)}`}`}
          icon={<Scale className="w-4 h-4 text-[#a05f1a]" />}
          tooltip="Telnyx Session Analysis total cost (AI assistant + inference only)"
        />
      </div>

      {/* Discrepancy Highlight Card */}
      <DiscrepancyCard
        discrepancy={discrepancy}
        selectedAssistantName={selectedAssistant ? selectedAssistant.name : 'All Assistants'}
      />

      {/* Per-Minute Cost Metrics & Layer Rates */}
      <PerMinuteMetricsCard metrics={metrics} services={services} />

      {/* Daily Usage Telemetry Chart in Light Warm Theme */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#3b110c] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8b372b]" />
              Daily Telemetry & Minute Consumption (Telnyx API)
            </h3>
            <p className="text-xs text-[#5d3d3a]">
              Daily billed conversation minutes and local priced costs.
            </p>
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-[#faf8f2] border border-[#dcd3c1] text-xs self-start sm:self-auto font-mono">
            <button
              onClick={() => setActiveChartMode('minutes')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeChartMode === 'minutes'
                  ? 'bg-[#ffffff] text-[#3b110c] font-bold shadow-2xs border border-[#dcd3c1]'
                  : 'text-[#7d6360] hover:text-[#3b110c]'
              }`}
            >
              Billed Mins
            </button>
            <button
              onClick={() => setActiveChartMode('cost')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeChartMode === 'cost'
                  ? 'bg-[#ffffff] text-[#3b110c] font-bold shadow-2xs border border-[#dcd3c1]'
                  : 'text-[#7d6360] hover:text-[#3b110c]'
              }`}
            >
              Cost ($)
            </button>
          </div>
        </div>

        {/* Daily Bars */}
        <div className="pt-4 pb-2">
          <div className="h-44 sm:h-52 flex items-end gap-1.5 sm:gap-2.5 w-full px-1">
            {daily.map((day, idx) => {
              const mins = day.billed_sec / 60;
              const val = activeChartMode === 'minutes' ? mins : day.recorded_cost || 0;
              const maxVal = activeChartMode === 'minutes' ? maxDailyMinutes : maxDailyCost;
              const heightPercent = Math.max(10, Math.round((val / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 z-20 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap bg-[#3b110c] text-[#f8eed2] px-2.5 py-1.5 rounded-lg shadow-lg text-[10px] font-mono">
                    <span className="font-bold">
                      {day.date}: {mins.toFixed(1)} mins (${(day.recorded_cost || 0).toFixed(4)})
                    </span>
                    <span className="text-[#e8dfce]">
                      {day.call_count} calls · ${(day.cost_per_minute || 0).toFixed(4)}/min
                    </span>
                  </div>

                  {/* Bar with Cinnamon & Coffee Warm Accent */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t bg-gradient-to-t from-[#8b372b] to-[#a05f1a] group-hover:from-[#722b20] group-hover:to-[#8b372b] transition-all shadow-2xs"
                  />

                  {/* Label */}
                  <span className="text-[10px] text-[#7d6360] font-mono truncate max-w-full font-medium">
                    {day.date.replace('Oct ', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Calls Feed */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#3b110c] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#8b372b]" />
              Latest Call Detail Records & Per-Minute Pricing
            </h3>
            <p className="text-xs text-[#5d3d3a]">
              Click any call row to inspect its exact Telnyx charges and session discrepancy.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('calls')}
            className="text-xs text-[#8b372b] hover:text-[#3b110c] font-bold cursor-pointer"
          >
            Full Log ({calls.length}) &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {calls.slice(0, 5).map((call) => {
            const min = call.duration_sec !== null ? Math.floor(call.duration_sec / 60) : 0;
            const sec = call.duration_sec !== null ? call.duration_sec % 60 : 0;
            const billedMin = (call.billed_sec / 60).toFixed(2);
            const isDiff = call.cost_discrepancy !== null && Math.abs(call.cost_discrepancy) > 0.0001;

            return (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className="p-3 rounded-xl bg-[#faf8f2] border border-[#e7decb] hover:border-[#8b372b] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#3b110c]">
                      {call.telnyx_conversation_id}
                    </span>
                    <span className="text-[10px] font-mono text-[#7d6360]">·</span>
                    <span className="text-xs text-[#3b110c] font-semibold">
                      {call.assistant_name}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        call.cost_status === 'recorded'
                          ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                          : 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                      }`}
                    >
                      {call.cost_status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#5d3d3a]">
                    {call.masked_caller || 'No caller ID'} · {call.duration_sec !== null ? `${min}m ${sec < 10 ? `0${sec}` : sec}s` : 'Unknown'} ({billedMin}m billed)
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                  {isDiff && (
                    <div className="text-[10px] font-mono text-[#a05f1a] font-semibold hidden md:block">
                      Telnyx: ${call.session_cost_total?.toFixed(4)} vs Sum: ${call.recorded_cost?.toFixed(4)}
                    </div>
                  )}

                  <div className="font-mono text-right">
                    <div className="font-bold text-xs sm:text-sm text-[#3b110c] tabular-nums">
                      {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                    </div>
                    <div className="text-[10px] text-[#8b372b] font-mono font-bold">
                      @ ${call.rate_per_min.toFixed(4)}/m
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#7d6360] hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
