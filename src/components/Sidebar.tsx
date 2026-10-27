import React from 'react';
import {
  LayoutDashboard,
  Scale,
  PhoneCall,
  CreditCard,
  Zap,
  Server,
  DollarSign,
  Clock,
} from 'lucide-react';
import { ActiveTab, DashboardMetrics } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  metrics: DashboardMetrics;
  totalCallsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  metrics,
  totalCallsCount,
}) => {
  const { kpis, discrepancy } = metrics;
  const blendedRate = kpis.blended_cost_per_minute || 0.0780;
  const hasDiscrepancy = Math.abs(discrepancy.delta) > 0.0001;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Admin Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'reconciliation',
      label: 'Cost Reconciliation',
      icon: <Scale className="w-4 h-4" />,
      badge: hasDiscrepancy ? `Δ $${Math.abs(discrepancy.delta).toFixed(2)}` : 'Matched',
      badgeColor: hasDiscrepancy ? 'bg-[#fdf2f2] text-[#da1c1c] border border-[#f5c6c6]' : 'bg-[#edf7f1] text-[#1f6f43]',
    },
    {
      id: 'calls',
      label: 'Call CDR Logs',
      icon: <PhoneCall className="w-4 h-4" />,
      badge: `${totalCallsCount}`,
    },
    {
      id: 'billing',
      label: 'Billing & Tie-Out',
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e7decb] flex flex-col justify-between shrink-0 min-h-[calc(100vh-53px)] hidden md:flex shadow-2xs">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#5d3d3a] mb-2 font-mono">
            Telnyx Admin Views
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f8eed2] text-[#3b110c] border border-[#e5d9bd] font-bold shadow-2xs'
                      : 'text-[#5d3d3a] hover:text-[#3b110c] hover:bg-[#faf8f2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#8b372b]' : 'text-[#7d6360]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-[#8b372b]/15 text-[#3b110c]'
                          : 'bg-[#f0ebe0] text-[#5d3d3a]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Telnyx Per-Minute Card */}
        <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e7decb] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3b110c] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#8b372b]" />
              Telnyx Per-Minute Rate
            </span>
            <span className="text-[10px] text-[#8b372b] font-mono font-bold bg-[#f8eed2] px-1.5 py-0.5 rounded">
              Real Telnyx
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[#5d3d3a]">
              <span>AI Voice Assistant</span>
              <span className="font-mono text-[#3b110c] font-medium tabular-nums">
                $0.0320 / m
              </span>
            </div>
            <div className="flex justify-between items-center text-[#5d3d3a]">
              <span>SIP Trunking</span>
              <span className="font-mono text-[#3b110c] font-medium tabular-nums">
                $0.0050 / m
              </span>
            </div>
            <div className="flex justify-between items-center text-[#5d3d3a]">
              <span>Call Control</span>
              <span className="font-mono text-[#3b110c] font-medium tabular-nums">
                $0.0020 / m
              </span>
            </div>
            <div className="flex justify-between items-center text-[#5d3d3a]">
              <span>Recording</span>
              <span className="font-mono text-[#3b110c] font-medium tabular-nums">
                $0.0020 / m
              </span>
            </div>
            <div className="flex justify-between items-center text-[#5d3d3a]">
              <span>STT Usage Report</span>
              <span className="font-mono text-[#3b110c] font-medium tabular-nums">
                $0.0150 / m
              </span>
            </div>
            <div className="pt-2 border-t border-[#e2d7c3] flex justify-between items-center font-semibold">
              <span className="text-[#3b110c]">Blended Rate</span>
              <span className="font-mono text-[#8b372b] font-bold tabular-nums">
                ${blendedRate.toFixed(4)} / min
              </span>
            </div>
          </div>
        </div>

        {/* Telnyx Cost Discrepancy Alert in Sidebar */}
        {hasDiscrepancy && (
          <div className="p-3 rounded-xl bg-[#fdf8f7] border border-[#f0c2bd] text-xs space-y-1.5 shadow-2xs">
            <div className="font-bold text-[#da1c1c] flex items-center gap-1">
              <span>Variance Alert</span>
            </div>
            <p className="text-[11px] text-[#5d3d3a] leading-relaxed">
              Telnyx session total differs from sum of call charges by{' '}
              <span className="font-mono text-[#3b110c] font-bold">
                ${Math.abs(discrepancy.delta).toFixed(4)}
              </span>.
            </p>
            <button
              onClick={() => onTabChange('reconciliation')}
              className="text-[11px] text-[#8b372b] hover:text-[#3b110c] font-bold underline underline-offset-2 cursor-pointer"
            >
              Inspect variance breakdown &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Admin system status footer */}
      <div className="p-4 border-t border-[#e7decb] space-y-1.5 text-xs text-[#5d3d3a] font-mono bg-[#faf8f2]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#3b110c]">
            <Server className="w-3.5 h-3.5 text-[#1f6f43]" />
            Telnyx API: v2
          </span>
          <span className="text-[10px] text-[#1f6f43] font-bold">Connected</span>
        </div>
        <div className="text-[11px] text-[#7d6360]">
          UTC Month: {metrics.month}
        </div>
      </div>
    </aside>
  );
};
