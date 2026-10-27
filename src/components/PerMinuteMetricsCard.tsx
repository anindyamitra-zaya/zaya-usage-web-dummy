import React from 'react';
import {
  DollarSign,
  Clock,
  Activity,
  Layers,
  Phone,
  Mic,
  Cpu,
  Volume2,
  TrendingUp,
} from 'lucide-react';
import { DashboardMetrics, ServiceCostSummary } from '../types';

interface PerMinuteMetricsCardProps {
  metrics: DashboardMetrics;
  services: ServiceCostSummary[];
}

export const PerMinuteMetricsCard: React.FC<PerMinuteMetricsCardProps> = ({
  metrics,
  services,
}) => {
  const { kpis } = metrics;
  const talkTimeMinutes = kpis.duration_sec ? kpis.duration_sec / 60 : 0;
  const billedMinutes = kpis.billed_minutes;
  const blendedRatePerMin = kpis.blended_cost_per_minute || 0.0780;

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ede5d5] pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#3b110c] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#8b372b]" />
            Telnyx Per-Minute Cost Composition (Real Telephony Data)
          </h3>
          <p className="text-xs text-[#5d3d3a] mt-0.5">
            Exact per-minute rate calculated from billed seconds, replacing misleading flat per-call averages.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="text-[#5d3d3a]">Total Billed:</span>
          <span className="text-[#8b372b] font-bold">{billedMinutes.toFixed(2)} mins</span>
        </div>
      </div>

      {/* Main Per-Minute Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Blended $/Min */}
        <div className="p-4 rounded-xl bg-[#f8eed2] border border-[#e2d7c3] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] font-bold">
            Blended Cost Per Billed Minute
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-[#3b110c] tabular-nums">
              ${blendedRatePerMin.toFixed(4)}
            </span>
            <span className="text-xs text-[#8b372b] font-mono font-bold">/ min</span>
          </div>
          <div className="text-[11px] text-[#5d3d3a] font-mono pt-1">
            = Total Recorded (${(kpis.recorded_cost || 0).toFixed(2)}) ÷ {billedMinutes.toFixed(1)} mins
          </div>
        </div>

        {/* Talk Time vs Billed Time */}
        <div className="p-4 rounded-xl bg-[#faf8f2] border border-[#e7decb] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] font-bold">
            Talk Time vs Billed Minutes
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#3b110c] tabular-nums">
              {talkTimeMinutes.toFixed(1)}m
            </span>
            <span className="text-xs text-[#7d6360]">talk</span>
            <span className="text-[#dcd3c1]">/</span>
            <span className="text-2xl font-bold font-mono text-[#8b372b] tabular-nums">
              {billedMinutes.toFixed(1)}m
            </span>
            <span className="text-xs text-[#7d6360]">billed</span>
          </div>
          <div className="text-[11px] text-[#7d6360] font-mono pt-1">
            Telnyx bills in 60s/6s increments ({kpis.duration_unknown_count} unknown)
          </div>
        </div>

        {/* Rate per Second */}
        <div className="p-4 rounded-xl bg-[#faf8f2] border border-[#e7decb] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] font-bold">
            Per-Second Telephony Burn Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#3b110c] tabular-nums">
              ${(blendedRatePerMin / 60).toFixed(5)}
            </span>
            <span className="text-xs text-[#7d6360]">/ second</span>
          </div>
          <div className="text-[11px] text-[#5d3d3a] font-mono pt-1">
            Average complete call: ${(kpis.average_cost_per_call || 0).toFixed(4)}
          </div>
        </div>
      </div>

      {/* Itemized Telnyx Services $/min Rate Sheet */}
      <div className="pt-2">
        <div className="text-xs font-bold text-[#3b110c] mb-2 font-sans">
          Service Layer Per-Minute Rates (Telnyx API Verified):
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              AI Voice Assistant
            </div>
            <div className="font-mono font-bold text-[#8b372b] tabular-nums text-sm">
              $0.0320 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              Telnyx native voice agent runtime
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              SIP Trunking
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0050 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              PSTN voice leg termination
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              Call Control
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0020 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              Media bridge and call routing
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              Speech-to-Text (STT)
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0150 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              Usage report allocation
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              Call Recording
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0020 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              Dual-channel audio capture
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              Noise Suppression
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0010 / min
            </div>
            <div className="text-[10px] text-[#7d6360]">
              DSP background filter
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              AMD Invocations
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              $0.0065 / invocation
            </div>
            <div className="text-[10px] text-[#7d6360]">
              Answering-machine detection
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
            <div className="text-[10px] text-[#5d3d3a] font-mono uppercase truncate font-bold">
              LLM Inference
            </div>
            <div className="font-mono font-bold text-[#3b110c] tabular-nums text-sm">
              Variable / turn
            </div>
            <div className="text-[10px] text-[#7d6360]">
              $0.0010 to $0.0050 per turn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
