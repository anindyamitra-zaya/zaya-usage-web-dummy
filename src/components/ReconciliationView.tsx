import React, { useState } from 'react';
import {
  Scale,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ReconciliationRow, DiscrepancyAnalysis } from '../types';
import { DiscrepancyCard } from './DiscrepancyCard';

interface ReconciliationViewProps {
  reconciliation: ReconciliationRow[];
  discrepancy: DiscrepancyAnalysis;
  selectedAssistantName: string;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  reconciliation,
  discrepancy,
  selectedAssistantName,
}) => {
  // By default hide analysis as requested
  const [showAuditAnalysis, setShowAuditAnalysis] = useState(false);

  return (
    <div className="space-y-4">
      {/* Title - Single Heading Line */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#e7decb]">
        <h2 className="text-base sm:text-lg font-bold text-[#3b110c] flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#8b372b]" />
          Cost Reconciliation
        </h2>

        <button
          onClick={() => setShowAuditAnalysis(!showAuditAnalysis)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#faf8f2] hover:bg-[#f3eedf] text-[#3b110c] border border-[#dcd3c1] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Info className="w-3.5 h-3.5 text-[#8b372b]" />
          <span>{showAuditAnalysis ? 'Hide Audit Methodology' : 'Show Audit Methodology'}</span>
          {showAuditAnalysis ? <ChevronUp className="w-3 h-3 text-[#5d3d3a]" /> : <ChevronDown className="w-3 h-3 text-[#5d3d3a]" />}
        </button>
      </div>

      {/* Discrepancy Component (analysis hidden by default) */}
      <DiscrepancyCard
        discrepancy={discrepancy}
        selectedAssistantName={selectedAssistantName}
      />

      {/* Audit Methodology Drawer (Hidden by default) */}
      {showAuditAnalysis && (
        <div className="p-3.5 rounded-xl bg-[#f8eed2]/60 border border-[#e5d9bd] space-y-2 text-xs">
          <div className="font-bold text-[#3b110c] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#8b372b]" />
            <span>Product Audit Accounting Methodology</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-[#5d3d3a]">
            <div className="p-2.5 bg-[#ffffff] rounded-lg border border-[#e2d7c3] space-y-1">
              <span className="font-bold text-[#3b110c] block">1. Session vs Detail Records</span>
              <p className="leading-relaxed">
                Telnyx Session Analysis reports aggregate conversational cost for the primary assistant leg. Carrier trunking and recording are billed as separate product CDR records.
              </p>
            </div>
            <div className="p-2.5 bg-[#ffffff] rounded-lg border border-[#e2d7c3] space-y-1">
              <span className="font-bold text-[#3b110c] block">2. Incomplete Charge Records</span>
              <p className="leading-relaxed">
                Calls flagged with &lsquo;P&rsquo; indicate recent calls whose Telnyx billing webhook arrived prior to rating finalization. They resolve automatically in the next sync pull.
              </p>
            </div>
            <div className="p-2.5 bg-[#ffffff] rounded-lg border border-[#e2d7c3] space-y-1">
              <span className="font-bold text-[#3b110c] block">3. Minimum Billable Increments</span>
              <p className="leading-relaxed">
                Telnyx rates voice legs in 60-second billing increments. Fractional calls (e.g. 15s) are rounded up to 60s, creating a slight duration delta with actual talk time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product-by-Product Telnyx Audit Table (Compact and Matched with Theme) */}
      <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#3b110c] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#8b372b]" />
              Product-by-Product Telnyx Audit Table
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f8eed2] text-[#3b110c] font-bold border border-[#e2d7c3]">
              {reconciliation.length} layers
            </span>
          </div>
          <span className="text-[11px] text-[#7d6360] font-mono">
            Currency: USD ($)
          </span>
        </div>

        <div className="overflow-x-auto -mx-3.5 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e7decb] bg-[#f8eed2] text-[#3b110c] font-mono text-[10px] uppercase tracking-wider font-bold">
                <th className="py-2 px-3 font-sans">Service Product</th>
                <th className="py-2 px-3 text-right">Telnyx Usage Cost</th>
                <th className="py-2 px-3 text-right">Priced Call Charges</th>
                <th className="py-2 px-3 text-right">Delta / Variance</th>
                <th className="py-2 px-3">Audit Status</th>
                <th className="py-2 px-3">Audit Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d5] font-mono text-[11px]">
              {reconciliation.map((row, idx) => {
                const isMatch = row.status === 'match';
                const isDiscrepancy = row.status === 'discrepancy';
                const isIncomplete = row.status === 'incomplete';

                return (
                  <tr key={idx} className="hover:bg-[#faf8f2] transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#3b110c] font-sans">
                      {row.label}
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-[#3b110c] tabular-nums">
                      {row.telnyx_cost !== null ? `$${row.telnyx_cost.toFixed(4)}` : 'Unavailable'}
                    </td>

                    <td className="py-2 px-3 text-right text-[#8b372b] font-bold tabular-nums">
                      {row.local_priced_cost !== null ? `$${row.local_priced_cost.toFixed(4)}` : '—'}
                    </td>

                    <td
                      className={`py-2 px-3 text-right font-bold tabular-nums ${
                        isDiscrepancy
                          ? 'text-[#da1c1c]'
                          : isMatch
                          ? 'text-[#1f6f43]'
                          : 'text-[#7d6360]'
                      }`}
                    >
                      {row.delta !== null
                        ? row.delta > 0
                          ? `+$${row.delta.toFixed(4)}`
                          : `$${row.delta.toFixed(4)}`
                        : '—'}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isMatch
                            ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                            : isDiscrepancy
                            ? 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                            : isIncomplete
                            ? 'bg-[#f8eed2] text-[#3b110c] border border-[#e2d7c3]'
                            : 'bg-[#faf8f2] text-[#5d3d3a] border border-[#e7decb]'
                        }`}
                      >
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-[#5d3d3a] font-sans text-[11px]">
                      {row.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
