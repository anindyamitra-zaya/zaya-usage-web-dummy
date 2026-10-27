import React, { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
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
  const [isExpanded, setIsExpanded] = useState(true);

  const isDifferent = Math.abs(discrepancy.delta) > 0.0001;

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f8eed2] border border-[#e2d7c3] flex items-center justify-center text-[#8b372b]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#3b110c] flex items-center gap-2">
              Telnyx Total vs Call Summation Reconciler
              {isDifferent && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#fdf2f2] text-[#da1c1c] border border-[#f5c6c6] font-bold">
                  Variance Detected
                </span>
              )}
            </h3>
            <p className="text-xs text-[#5d3d3a]">
              Audit for <span className="text-[#3b110c] font-semibold">{selectedAssistantName}</span>: Comparing Telnyx Session Analysis total with the sum of all individual call charges.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#8b372b] hover:text-[#3b110c] font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Analysis' : 'Show Analysis'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Comparison Strip in Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Telnyx Reported Total */}
        <div className="p-3.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Telnyx Reported Cost</span>
            <span className="text-[9px] text-[#8b372b] font-bold bg-[#f8eed2] px-1 rounded">Session Analysis</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#3b110c] tabular-nums">
            ${discrepancy.telnyxGivenTotal.toFixed(4)}
          </div>
          <div className="text-[10px] text-[#7d6360] font-mono">
            AI Assistant minutes + LLM inference turns
          </div>
        </div>

        {/* Summation of Call Costs */}
        <div className="p-3.5 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Sum of Call Charges</span>
            <span className="text-[9px] text-[#1f6f43] font-bold bg-[#edf7f1] px-1 rounded">Priced CDRs</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#8b372b] tabular-nums">
            ${discrepancy.summationOfCallCosts.toFixed(4)}
          </div>
          <div className="text-[10px] text-[#7d6360] font-mono">
            Carrier legs + SIP + AMD + Recording + AI
          </div>
        </div>

        {/* Delta / Discrepancy */}
        <div className={`p-3.5 rounded-lg border space-y-1 ${
          isDifferent
            ? 'bg-[#fdf8f7] border-[#f0c2bd] text-[#da1c1c]'
            : 'bg-[#edf7f1] border-[#a8dfc1] text-[#1f6f43]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#5d3d3a] flex items-center justify-between">
            <span>Net Variance (Delta)</span>
            <span className="text-[10px] font-bold font-mono text-[#3b110c]">
              {discrepancy.percentageVariance}% diff
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums">
            {discrepancy.delta >= 0 ? `+$${discrepancy.delta.toFixed(4)}` : `-$${Math.abs(discrepancy.delta).toFixed(4)}`}
          </div>
          <div className="text-[10px] text-[#5d3d3a] font-mono">
            {isDifferent ? 'Carrier charges & pending rows explain delta' : 'Exact match with Telnyx'}
          </div>
        </div>
      </div>

      {/* Expanded Breakdown of WHY the numbers differ */}
      {isExpanded && (
        <div className="pt-3 border-t border-[#ede5d5] space-y-3 text-xs">
          <div className="text-[11px] font-semibold text-[#3b110c] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#8b372b]" />
            Why Telnyx Given Total Differs from Call Summation:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {discrepancy.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#faf8f2] border border-[#e7decb] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3b110c]">
                    {reason.title}
                  </span>
                  <span className="font-mono text-[#8b372b] text-[11px] font-bold">
                    ~${reason.impactAmount.toFixed(4)}
                  </span>
                </div>
                <p className="text-[11px] text-[#5d3d3a] leading-relaxed">
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
