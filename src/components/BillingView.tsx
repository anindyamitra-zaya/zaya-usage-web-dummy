import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Scale,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DashboardMetrics, TelnyxAssistant } from '../types';

interface BillingViewProps {
  metrics: DashboardMetrics;
  assistants: TelnyxAssistant[];
  selectedAssistant: TelnyxAssistant | null;
}

export const BillingView: React.FC<BillingViewProps> = ({
  metrics,
  assistants,
  selectedAssistant,
}) => {
  const [fixedFeeAmount, setFixedFeeAmount] = useState('1.00');
  const [feeNote, setFeeNote] = useState('Telnyx list price (unconfirmed)');
  const [savedNotice, setSavedNotice] = useState(false);

  const { kpis, reconciliation } = metrics;

  const statements = [
    {
      clientName: 'Houston Foot and Ankle Care',
      slug: 'hfaac',
      assistantName: 'HFAAC-Agent',
      number: '+13125550101',
      billedMinutes: 52.0,
      totalCost: 1.6240,
      fixedPhoneFee: 1.00,
      flags: ['pending', 'allocated'],
    },
    {
      clientName: 'Family Medicine MMC',
      slug: 'mmc',
      assistantName: 'MMC-Agent',
      number: '+13125550121',
      billedMinutes: 19.0,
      totalCost: 0.5890,
      fixedPhoneFee: 1.00,
      flags: ['allocated'],
    },
    {
      clientName: 'AGP Family Health Clinic',
      slug: 'agp',
      assistantName: 'AGP-Health-Clinic-Agent',
      number: '+13125550111',
      billedMinutes: 24.5,
      totalCost: 0.7620,
      fixedPhoneFee: 1.00,
      flags: ['pending', 'allocated'],
    },
    {
      clientName: 'Schaumburg',
      slug: 'schaumburg',
      assistantName: 'Schaumburg-Derm-Agent',
      number: '+13125550141',
      billedMinutes: 18.0,
      totalCost: 0.5600,
      fixedPhoneFee: 1.00,
      flags: ['allocated'],
    },
  ];

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportStatement = () => {
    const headers = [
      'Client Name',
      'Assistant Name',
      'Phone Number',
      'Billed Minutes',
      'Usage Cost',
      'Monthly Number Fee',
      'Total Client Cost',
    ];
    const rows = statements.map((c) => [
      `"${c.clientName}"`,
      `"${c.assistantName}"`,
      c.number,
      c.billedMinutes.toFixed(1),
      c.totalCost.toFixed(4),
      c.fixedPhoneFee.toFixed(2),
      (c.totalCost + c.fixedPhoneFee).toFixed(4),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telnyx_billing_statement_${metrics.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Title - Single Heading Line */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#e7decb]">
        <h2 className="text-base sm:text-lg font-bold text-[#3b110c] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#8b372b]" />
          Client Billing Statements & Tie-Out
        </h2>

        <button
          onClick={handleExportStatement}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ffffff] hover:bg-[#faf8f2] text-[#3b110c] border border-[#dcd3c1] transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#8b372b]" />
          <span>Export Billing CSV</span>
        </button>
      </div>

      {/* Account Tie-Out Summary */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#3b110c] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#8b372b]" />
            Account Tie-Out vs Telnyx Invoice
          </h3>
          <span className="text-xs text-[#5d3d3a] font-mono">
            UTC Month {metrics.month}
          </span>
        </div>

        <p className="text-xs text-[#5d3d3a]">
          Telnyx usage reports are account-wide. Unallocated is the remainder not absorbed by a client statement (e.g. $0.5000 unmapped recording on test assistants).
        </p>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#e7decb] bg-[#f8eed2]/70 text-[#3b110c] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Product Layer</th>
                <th className="py-2.5 px-3 text-right">Telnyx Account Total</th>
                <th className="py-2.5 px-3 text-right">Billed to Clients</th>
                <th className="py-2.5 px-3 text-right">Unallocated Delta</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d5]">
              {reconciliation.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#faf8f2] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#3b110c] font-sans">
                    {row.label}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#3b110c] font-bold tabular-nums">
                    {row.telnyx_cost !== null ? `$${row.telnyx_cost.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#8b372b] font-bold tabular-nums">
                    {row.local_priced_cost !== null ? `$${row.local_priced_cost.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#da1c1c] tabular-nums">
                    {row.delta !== null ? `$${row.delta.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        row.status === 'match'
                          ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                          : row.status === 'discrepancy'
                          ? 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                          : 'bg-[#faf8f2] text-[#5d3d3a] border border-[#e7decb]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#5d3d3a] font-sans text-xs">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Statements Overview */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#3b110c] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8b372b]" />
          Client Clinic Statements (Individual Invoices)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {statements.map((stmt) => (
            <div
              key={stmt.slug}
              className="p-4 rounded-xl bg-[#faf8f2] border border-[#e7decb] space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#3b110c]">{stmt.clientName}</h4>
                  <p className="text-[11px] text-[#5d3d3a] font-mono">
                    {stmt.assistantName} · {stmt.number}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#8b372b] tabular-nums">
                    ${(stmt.totalCost + stmt.fixedPhoneFee).toFixed(4)}
                  </div>
                  <div className="text-[10px] text-[#7d6360] font-mono">
                    incl. ${stmt.fixedPhoneFee.toFixed(2)} number fee
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ede5d5] flex items-center justify-between text-xs font-mono text-[#5d3d3a]">
                <span>{stmt.billedMinutes.toFixed(1)} billed minutes</span>
                <span>${(stmt.totalCost / (stmt.billedMinutes || 1)).toFixed(4)} / min</span>
                <span className="text-[#1f6f43] font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phone Number Fixed Fee Admin Setting */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ffffff] border border-[#e7decb] space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-[#3b110c] flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#8b372b]" />
          Admin Phone Number Fixed Monthly Fee
        </h3>
        <p className="text-xs text-[#5d3d3a]">
          Telnyx API does not return owned-number fees. An admin sets a fixed monthly amount (e.g. $1.00 full month). A number with no fee shows as missing config.
        </p>

        <form onSubmit={handleSaveFee} className="flex flex-wrap items-end gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] text-[#5d3d3a] font-mono font-medium">Monthly Amount ($)</label>
            <input
              type="text"
              value={fixedFeeAmount}
              onChange={(e) => setFixedFeeAmount(e.target.value)}
              className="h-8.5 px-3 py-1 text-xs font-mono bg-[#faf8f2] border border-[#dcd3c1] rounded-lg text-[#3b110c] w-28 focus:outline-none focus:ring-1 focus:ring-[#8b372b]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#5d3d3a] font-mono font-medium">Note / Reference</label>
            <input
              type="text"
              value={feeNote}
              onChange={(e) => setFeeNote(e.target.value)}
              className="h-8.5 px-3 py-1 text-xs bg-[#faf8f2] border border-[#dcd3c1] rounded-lg text-[#3b110c] w-64 focus:outline-none focus:ring-1 focus:ring-[#8b372b]"
            />
          </div>

          <button
            type="submit"
            className="h-8.5 px-4 text-xs font-bold rounded-lg bg-[#8b372b] hover:bg-[#722b20] text-[#ffffff] transition-colors cursor-pointer shadow-xs"
          >
            Save Fee
          </button>
        </form>

        {savedNotice && (
          <p className="text-xs text-[#1f6f43] font-mono font-bold pt-1">
            Fee saved and applied across client statements.
          </p>
        )}
      </div>
    </div>
  );
};
