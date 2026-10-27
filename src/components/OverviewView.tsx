import React from 'react';
import {
  Clock,
  DollarSign,
  PhoneCall,
  Activity,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { DiscrepancyCard } from './DiscrepancyCard';
import { DailyComboChart } from './DailyComboChart';
import { BudgetAlertCard, BudgetConfig } from './BudgetAlertCard';
import { TelnyxAnalyticsGrid } from './TelnyxAnalyticsGrid';
import {
  TelnyxCall,
  DashboardMetrics,
  ActiveTab,
  TelnyxAssistant,
} from '../types';
import { formatInTimezone } from '../utils/dashboardHelpers';

interface OverviewViewProps {
  metrics: DashboardMetrics;
  calls: TelnyxCall[];
  assistants: TelnyxAssistant[];
  selectedAssistant: TelnyxAssistant | null;
  onSelectCall: (call: TelnyxCall) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  timezone: string;
  budgetConfig: BudgetConfig;
  onUpdateBudgetConfig: (newConfig: BudgetConfig) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  calls,
  assistants,
  selectedAssistant,
  onSelectCall,
  onNavigateTab,
  timezone,
  budgetConfig,
  onUpdateBudgetConfig,
}) => {
  const { kpis, discrepancy, daily } = metrics;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#e7decb]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b110c] bg-[#f8eed2] px-2 py-0.2 rounded border border-[#e2d7c3] font-bold">
              Telnyx Operations Console
            </span>
            <span className="text-xs text-[#5d3d3a] font-mono font-medium">
              Live API Sync · {timezone}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#3b110c]">
            {selectedAssistant ? selectedAssistant.name : 'All Telnyx Voice Assistants'}
          </h1>
          <p className="text-xs text-[#5d3d3a]">
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

      {/* 1. Primary KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
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

      {/* 2. Configurable Budget Limit Alert Section */}
      <BudgetAlertCard
        currentSpend={kpis.recorded_cost || 0}
        config={budgetConfig}
        onUpdateConfig={onUpdateBudgetConfig}
      />

      {/* 3. DAILY COST & MINUTES (CALL COUNT) GRAPH - MUST BE AFTER KPI CARDS & SCROLLABLE */}
      <DailyComboChart daily={daily} />

      {/* 4. More Charts & Visualizations from Telnyx API */}
      <TelnyxAnalyticsGrid
        calls={calls}
        assistants={assistants}
        timezone={timezone}
      />

      {/* 5. Discrepancy Highlight Card (Analysis hidden by default) */}
      <DiscrepancyCard
        discrepancy={discrepancy}
        selectedAssistantName={selectedAssistant ? selectedAssistant.name : 'All Assistants'}
      />

      {/* 6. Recent Calls Feed - Compact */}
      <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#3b110c] flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#8b372b]" />
              Latest Call Detail Records & Pricing
            </h3>
            <p className="text-[11px] text-[#5d3d3a]">
              Inspect recent call timestamps in {timezone} and charge compositions.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('calls')}
            className="text-xs text-[#8b372b] hover:text-[#3b110c] font-bold cursor-pointer"
          >
            Full CDR Log ({calls.length}) &rarr;
          </button>
        </div>

        <div className="space-y-2">
          {calls.slice(0, 5).map((call) => {
            const min = call.duration_sec !== null ? Math.floor(call.duration_sec / 60) : 0;
            const sec = call.duration_sec !== null ? call.duration_sec % 60 : 0;
            const billedMin = (call.billed_sec / 60).toFixed(2);
            const isDiff = call.cost_discrepancy !== null && Math.abs(call.cost_discrepancy) > 0.0001;

            return (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] hover:border-[#8b372b] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#3b110c]">
                      {call.telnyx_conversation_id}
                    </span>
                    <span className="text-[10px] text-[#7d6360]">·</span>
                    <span className="text-xs text-[#3b110c] font-semibold">
                      {call.assistant_name}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                        call.cost_status === 'recorded'
                          ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                          : 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                      }`}
                    >
                      {call.cost_status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#5d3d3a]">
                    {formatInTimezone(call.started_at, timezone, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {call.masked_caller || 'No caller ID'} · {call.duration_sec !== null ? `${min}m ${sec < 10 ? `0${sec}` : sec}s` : 'Unknown'} ({billedMin}m billed)
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                  <div className="font-mono text-right">
                    <div className="font-bold text-xs sm:text-sm text-[#3b110c] tabular-nums">
                      {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                    </div>
                    <div className="text-[9.5px] text-[#8b372b] font-mono font-bold">
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
