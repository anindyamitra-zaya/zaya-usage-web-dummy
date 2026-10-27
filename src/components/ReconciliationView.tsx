import React from 'react';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  FileSpreadsheet,
  Info,
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
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e7decb]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3b110c] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#8b372b]" />
            Telnyx Account & CDR Cost Reconciliation
          </h2>
          <p className="text-xs sm:text-sm text-[#5d3d3a] mt-0.5">
            Compare account-wide Telnyx usage reports with locally aggregated call CDR charges to audit discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5d3d3a] font-semibold">
          <span>Account Level: UTC Month</span>
        </div>
      </div>

      {/* Hero Discrepancy Component */}
      <DiscrepancyCard
        discrepancy={discrepancy}
        selectedAssistantName={selectedAssistantName}
      />

      {/* Reconciliation Table */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#3b110c] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8b372b]" />
            Product-by-Product Telnyx Audit Table
          </h3>
          <span className="text-xs text-[#5d3d3a] font-mono">
            {reconciliation.length} products verified
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e7decb] bg-[#f8eed2]/70 text-[#3b110c] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Service Product</th>
                <th className="py-2.5 px-3 text-right">Telnyx Usage Cost</th>
                <th className="py-2.5 px-3 text-right">Priced Call Charges</th>
                <th className="py-2.5 px-3 text-right">Delta / Variance</th>
                <th className="py-2.5 px-3">Audit Status</th>
                <th className="py-2.5 px-3">Explanation Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d5] font-mono">
              {reconciliation.map((row, idx) => {
                const isMatch = row.status === 'match';
                const isDiscrepancy = row.status === 'discrepancy';
                const isIncomplete = row.status === 'incomplete';
                const isUsageReport = row.status === 'usage_report';

                return (
                  <tr key={idx} className="hover:bg-[#faf8f2] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#3b110c] font-sans">
                      {row.label}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-[#3b110c] tabular-nums">
                      {row.telnyx_cost !== null ? `$${row.telnyx_cost.toFixed(4)}` : 'Unavailable'}
                    </td>

                    <td className="py-3 px-3 text-right text-[#8b372b] font-bold tabular-nums">
                      {row.local_priced_cost !== null ? `$${row.local_priced_cost.toFixed(4)}` : '—'}
                    </td>

                    <td className={`py-3 px-3 text-right font-bold tabular-nums ${
                      isDiscrepancy ? 'text-[#da1c1c]' : isMatch ? 'text-[#1f6f43]' : 'text-[#7d6360]'
                    }`}>
                      {row.delta !== null
                        ? row.delta > 0
                          ? `+$${row.delta.toFixed(4)}`
                          : `$${row.delta.toFixed(4)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
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

                    <td className="py-3 px-3 text-[#5d3d3a] font-sans text-xs">
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
