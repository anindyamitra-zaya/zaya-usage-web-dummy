import React, { useState } from 'react';
import {
  Scale,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { DiscrepancyAnalysis } from '../types';

interface DiscrepancyCardProps {
  discrepancy: DiscrepancyAnalysis;
  selectedAssistantName: string;
}

export const DiscrepancyCard: React.FC<DiscrepancyCardProps> = ({
  discrepancy,
  selectedAssistantName,
}) => {
  // By default hide analysis as requested
  const [isExpanded, setIsExpanded] = useState(false);

  const isDifferent = Math.abs(discrepancy.delta) > 0.0001;

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3 sm:p-4 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f8eed2] border border-[#e2d7c3] flex items-center justify-center text-[#8b372b] shrink-0">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#3b110c]">
                Telnyx Total vs Call Summation Reconciler
              </h3>
              {isDifferent && (
                <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#fdf2f2] text-[#da1c1c] border border-[#f5c6c6] font-bold">
                  Variance Detected
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5d3d3a]">
              Audit for <strong className="text-[#3b110c]">{selectedAssistantName}</strong>: Telnyx Session Analysis total vs sum of priced charge records.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#8b372b] hover:text-[#3b110c] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Analysis' : 'Show Analysis'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Comparison Strip in Warm Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Telnyx Reported Total */}
        <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Telnyx Reported Cost</span>
            <span className="text-[8.5px] text-[#8b372b] font-bold bg-[#f8eed2] px-1 rounded">Session Total</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#3b110c] tabular-nums">
            ${discrepancy.telnyxGivenTotal.toFixed(4)}
          </div>
          <div className="text-[9.5px] text-[#7d6360] font-mono">
            AI Assistant + LLM inference turns
          </div>
        </div>

        {/* Summation of Call Costs */}
        <div className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Sum of Call Charges</span>
            <span className="text-[8.5px] text-[#1f6f43] font-bold bg-[#edf7f1] px-1 rounded">Priced CDRs</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#8b372b] tabular-nums">
            ${discrepancy.summationOfCallCosts.toFixed(4)}
          </div>
          <div className="text-[9.5px] text-[#7d6360] font-mono">
            SIP + AMD + Carrier + Audio + AI
          </div>
        </div>

        {/* Delta / Discrepancy */}
        <div
          className={`p-2.5 rounded-lg border space-y-0.5 ${
            isDifferent
              ? 'bg-[#fdf8f7] border-[#f0c2bd] text-[#da1c1c]'
              : 'bg-[#edf7f1] border-[#a8dfc1] text-[#1f6f43]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Net Variance (Delta)</span>
            <span className="text-[9.5px] font-bold font-mono text-[#3b110c]">
              {discrepancy.percentageVariance}% diff
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums">
            {discrepancy.delta >= 0
              ? `+$${discrepancy.delta.toFixed(4)}`
              : `-$${Math.abs(discrepancy.delta).toFixed(4)}`}
          </div>
          <div className="text-[9.5px] text-[#5d3d3a] font-mono">
            {isDifferent ? 'Carrier legs & pending rows explain delta' : 'Exact match with Telnyx'}
          </div>
        </div>
      </div>

      {/* Expanded Breakdown of WHY the numbers differ (Hidden by default) */}
      {isExpanded && (
        <div className="pt-2.5 border-t border-[#ede5d5] space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-[#3b110c] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#8b372b]" />
            Why Telnyx Given Total Differs from Call Summation:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {discrepancy.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3b110c] text-xs">
                    {reason.title}
                  </span>
                  <span className="font-mono text-[#8b372b] text-[10px] font-bold">
                    ~${reason.impactAmount.toFixed(4)}
                  </span>
                </div>
                <p className="text-[10.5px] text-[#5d3d3a] leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
