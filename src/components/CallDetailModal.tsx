import React from 'react';
import {
  X,
  Phone,
  Clock,
  DollarSign,
  Activity,
  Mic,
  Cpu,
  Volume2,
  Server,
  CheckCircle,
  AlertTriangle,
  Scale,
  Layers,
  FileText,
} from 'lucide-react';
import { TelnyxCall, TelnyxCharge } from '../types';

interface CallDetailModalProps {
  call: TelnyxCall | null;
  onClose: () => void;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({ call, onClose }) => {
  if (!call) return null;

  const durationMin = call.duration_sec !== null ? Math.floor(call.duration_sec / 60) : 0;
  const durationSec = call.duration_sec !== null ? call.duration_sec % 60 : 0;
  const billedMin = (call.billed_sec / 60).toFixed(2);

  const isDiff = call.cost_discrepancy !== null && Math.abs(call.cost_discrepancy) > 0.0001;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#3b110c]/30 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl my-auto bg-[#ffffff] border border-[#e7decb] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ede5d5] flex items-center justify-between bg-[#f8eed2]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3b110c] flex items-center justify-center text-[#f8eed2]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#3b110c]">
                  {call.telnyx_conversation_id}
                </span>
                <span className="text-[11px] font-mono text-[#7d6360]">·</span>
                <span className="text-xs text-[#5d3d3a] font-semibold">
                  {call.assistant_name}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                    call.cost_status === 'recorded'
                      ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                      : 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                  }`}
                >
                  {call.cost_status}
                </span>
              </div>
              <div className="text-[11px] text-[#5d3d3a] font-mono mt-0.5">
                Caller: {call.masked_caller || 'No caller ID'} · Started: {call.started_at}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#5d3d3a] hover:text-[#3b110c] hover:bg-[#ede5d5]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Per-Minute Cost & Calculation Receipt */}
          <div className="p-4 rounded-xl bg-[#faf8f2] border border-[#e7decb] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ede5d5] pb-2">
              <span className="text-xs font-bold text-[#3b110c] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#8b372b]" />
                Per-Minute Cost Calculation Audit
              </span>
              <span className="text-[11px] font-mono text-[#8b372b] font-bold">
                Formula: Total Cost ÷ Billed Minutes = Rate/Min
              </span>
            </div>

            {/* Formula calculation display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#ffffff] border border-[#e7decb] shadow-2xs">
                <div className="text-[11px] text-[#5d3d3a] mb-1 font-medium">Talk Time vs Billed</div>
                <div className="text-lg font-bold font-mono text-[#3b110c] tabular-nums">
                  {call.duration_sec !== null ? `${durationMin}m ${durationSec}s` : 'Unknown'}
                </div>
                <div className="text-[10px] text-[#8b372b] font-mono font-semibold mt-0.5">
                  = {billedMin} billed minutes ({call.billed_sec}s)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#f8eed2] border border-[#e2d7c3] shadow-2xs">
                <div className="text-[11px] text-[#5d3d3a] font-bold mb-1">Per-Minute Rate</div>
                <div className="text-lg font-bold font-mono text-[#8b372b] tabular-nums">
                  ${call.rate_per_min.toFixed(4)}
                </div>
                <div className="text-[10px] text-[#5d3d3a] font-mono mt-0.5">
                  / billed minute
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#ffffff] border border-[#e7decb] shadow-2xs">
                <div className="text-[11px] text-[#5d3d3a] mb-1 font-medium">Total Call Cost (Charges Sum)</div>
                <div className="text-lg font-bold font-mono text-[#3b110c] tabular-nums">
                  {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                </div>
                <div className="text-[10px] text-[#1f6f43] font-mono font-semibold mt-0.5">
                  Sum of all Telnyx CDR rows
                </div>
              </div>
            </div>

            {/* Telnyx Session vs Sum Discrepancy Box */}
            <div className="p-3.5 rounded-lg bg-[#ffffff] border border-[#e7decb] space-y-2 text-xs font-mono shadow-2xs">
              <div className="flex items-center justify-between text-[#3b110c]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Scale className="w-3.5 h-3.5 text-[#8b372b]" />
                  Telnyx Session Analysis vs Sum of Call Charges:
                </span>
                <span className={`font-bold ${isDiff ? 'text-[#da1c1c]' : 'text-[#1f6f43]'}`}>
                  {isDiff ? `Delta: $${call.cost_discrepancy?.toFixed(4)}` : 'Matches Exactly'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5d3d3a] pt-1.5 border-t border-[#ede5d5]">
                <div>
                  <span className="text-[#7d6360]">Telnyx Session Total: </span>
                  <span className="text-[#3b110c] font-bold">
                    {call.session_cost_total !== null ? `$${call.session_cost_total.toFixed(4)}` : 'N/A'}
                  </span>
                  <span className="text-[#7d6360] block text-[10px] font-sans">
                    (AI voice minutes + LLM inference only)
                  </span>
                </div>
                <div>
                  <span className="text-[#7d6360]">Sum of All Call Charges: </span>
                  <span className="text-[#8b372b] font-bold">
                    {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                  </span>
                  <span className="text-[#7d6360] block text-[10px] font-sans">
                    (Includes SIP, Call Control, AMD, Recording)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Telnyx CDR Charges Itemization */}
          <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-3 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b110c] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8b372b]" />
                Itemized Telnyx Charge Records ({call.charges.length} rows)
              </span>
              <span className="text-[10px] font-mono text-[#5d3d3a] font-semibold bg-[#faf8f2] px-2 py-0.5 rounded border border-[#e7decb]">
                Telnyx Record ID Match
              </span>
            </div>

            <div className="divide-y divide-[#ede5d5] font-mono">
              {call.charges.map((charge, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[#3b110c] font-sans font-semibold text-xs">
                      {charge.service}
                    </div>
                    <div className="text-[10px] text-[#7d6360]">
                      ID: {charge.telnyx_record_id} {charge.rate ? `· rate: ${charge.rate} / ${charge.rate_unit}` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#3b110c] tabular-nums">
                      {charge.amount !== null ? `$${charge.amount.toFixed(4)}` : 'Pending'}
                    </div>
                    <div className="text-[10px] text-[#7d6360]">
                      {charge.billed_duration_sec ? `${charge.billed_duration_sec}s billed` : 'flat / event'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#ede5d5] bg-[#faf8f2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#5d3d3a] font-mono">
            <span>Leg ID: {call.telnyx_call_leg_id || 'N/A'}</span>
            <span>·</span>
            <span>Session: {call.telnyx_call_session_id || 'N/A'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#8b372b] hover:bg-[#722b20] text-[#ffffff] transition-colors cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
