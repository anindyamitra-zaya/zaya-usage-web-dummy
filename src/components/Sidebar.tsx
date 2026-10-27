import React, { useState } from 'react';
import {
  LayoutDashboard,
  Scale,
  PhoneCall,
  CreditCard,
  RefreshCw,
  Clock,
  Globe,
  Server,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { ActiveTab, DashboardMetrics, SyncConfig } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  metrics: DashboardMetrics;
  totalCallsCount: number;
  syncConfig: SyncConfig;
  onManualSync: () => void;
  onUpdateInterval: (intervalMinutes: number) => void;
  onToggleAutoSync: () => void;
  timezone: string;
  onSelectTimezone: (tz: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Universal Coordinated)' },
  { value: 'America/New_York', label: 'EST / EDT (New York)' },
  { value: 'America/Chicago', label: 'CST / CDT (Chicago)' },
  { value: 'America/Denver', label: 'MST / MDT (Denver)' },
  { value: 'America/Los_Angeles', label: 'PST / PDT (Los Angeles)' },
  { value: 'Europe/London', label: 'GMT / BST (London)' },
  { value: 'Asia/Kolkata', label: 'IST (India Standard)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  metrics,
  totalCallsCount,
  syncConfig,
  onManualSync,
  onUpdateInterval,
  onToggleAutoSync,
  timezone,
  onSelectTimezone,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);
  const intervals = [1, 2, 5, 10, 15];

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Admin Overview',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'reconciliation',
      label: 'Cost Reconciliation',
      icon: <Scale className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'calls',
      label: 'Call CDR Logs',
      icon: <PhoneCall className="w-4 h-4 shrink-0" />,
      badge: `${totalCallsCount}`,
    },
    {
      id: 'billing',
      label: 'Billing & Tie-Out',
      icon: <CreditCard className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`hidden md:flex sticky top-[53px] h-[calc(100vh-53px)] max-h-[calc(100vh-53px)] z-20 bg-[#ffffff] border-r border-[#e7decb] flex-col justify-between shrink-0 shadow-2xs transition-all duration-300 overflow-hidden select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Upper Navigation & Sync Panel (Strictly non-scrollable) */}
      <div className="p-2.5 space-y-2 overflow-hidden flex-1 flex flex-col justify-start">
        {/* Collapse toggle header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#ede5d5] shrink-0">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d3d3a] font-mono">
              Telnyx Admin Views
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-md text-[#5d3d3a] hover:text-[#3b110c] hover:bg-[#faf8f2] transition-colors cursor-pointer ml-auto"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#8b372b]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-[#8b372b]" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-0.5 shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f8eed2] text-[#3b110c] border border-[#e5d9bd] font-bold shadow-2xs'
                    : 'text-[#5d3d3a] hover:text-[#3b110c] hover:bg-[#faf8f2]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-[#8b372b]' : 'text-[#7d6360]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ${
                      isActive
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

        {/* TELNYX LIVE SYNC SECTION IN SIDEBAR */}
        {!isCollapsed ? (
          <div className="rounded-lg bg-[#faf8f2] border border-[#e7decb] p-2 space-y-1.5 shadow-2xs text-xs shrink-0 mt-1">
            {/* Header: Telnyx Live Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1f6f43] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1f6f43]"></span>
                </span>
                <span className="font-bold text-[#3b110c] text-[11px]">
                  Telnyx Live Sync
                </span>
              </div>

              {/* Interval badge / menu trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowIntervalMenu(!showIntervalMenu)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ffffff] border border-[#dcd3c1] text-[10px] font-mono text-[#3b110c] cursor-pointer hover:bg-[#f3eedf]"
                >
                  <span>{syncConfig.intervalMinutes}m</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#7d6360]" />
                </button>

                {showIntervalMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-[#ffffff] border border-[#dcd3c1] p-1.5 shadow-xl z-30 space-y-1">
                    <span className="text-[9px] uppercase font-mono text-[#7d6360] block font-bold px-1">
                      Interval
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {intervals.map((int) => (
                        <button
                          key={int}
                          onClick={() => {
                            onUpdateInterval(int);
                            setShowIntervalMenu(false);
                          }}
                          className={`px-1 py-0.5 rounded text-[10px] font-mono text-center cursor-pointer ${
                            syncConfig.intervalMinutes === int
                              ? 'bg-[#8b372b] text-white font-bold'
                              : 'bg-[#faf8f2] text-[#3b110c] hover:bg-[#ede5d5]'
                          }`}
                        >
                          {int}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Auto-Pull & Last Synced */}
            <div className="space-y-0.5 font-mono text-[10px] text-[#5d3d3a]">
              {syncConfig.autoSyncEnabled ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8b372b]" />
                    <span>Next auto-pull:</span>
                  </span>
                  <span className="font-bold text-[#3b110c] tabular-nums">
                    {formatCountdown(syncConfig.nextSyncSeconds)}{' '}
                    <span className="text-[9px] text-[#7d6360]">
                      ({syncConfig.intervalMinutes}m interval)
                    </span>
                  </span>
                </div>
              ) : (
                <div className="text-[#a05f1a] font-bold">Auto-sync paused</div>
              )}

              {syncConfig.lastSyncAt && (
                <div className="text-[9px] text-[#7d6360] truncate">
                  Last synced: {syncConfig.lastSyncAt}
                </div>
              )}
            </div>

            {/* Sync Live Data Button */}
            <button
              onClick={onManualSync}
              disabled={syncConfig.isSyncing}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#8b372b] hover:bg-[#722b20] text-white text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw
                className={`w-3 h-3 ${syncConfig.isSyncing ? 'animate-spin' : ''}`}
              />
              <span>{syncConfig.isSyncing ? 'Syncing Telnyx…' : 'Sync Live Data'}</span>
            </button>

            {/* API Response Status */}
            {syncConfig.lastSyncStats && (
              <div className="pt-1 border-t border-[#ede5d5] text-[9px] font-mono text-[#5d3d3a] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[#1f6f43] shrink-0" />
                <span className="leading-tight truncate">
                  Telnyx API: 200 OK · {syncConfig.lastSyncStats.callsSeen} calls · {syncConfig.lastSyncStats.chargesSeen} charges
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed Mini Sync Icon */
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#ede5d5] shrink-0">
            <button
              onClick={onManualSync}
              disabled={syncConfig.isSyncing}
              title={`Telnyx Live Sync (${syncConfig.intervalMinutes}m interval) - Click to Sync`}
              className="p-2 rounded-lg bg-[#faf8f2] hover:bg-[#f8eed2] text-[#8b372b] border border-[#e7decb] transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncConfig.isSyncing ? 'animate-spin' : ''}`}
              />
            </button>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1f6f43]"></span>
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: TIMEZONE SELECTOR & STATUS FOOTER (Strictly fixed at bottom) */}
      <div className="p-2.5 border-t border-[#e7decb] space-y-1.5 bg-[#faf8f2] text-xs font-mono shrink-0">
        {!isCollapsed ? (
          <>
            {/* Timezone Selector matching theme */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase text-[#5d3d3a] flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#8b372b]" />
                <span>Dashboard Timezone</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => onSelectTimezone(e.target.value)}
                className="w-full py-1 px-2 rounded-lg bg-[#ffffff] border border-[#dcd3c1] text-[#3b110c] text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#8b372b] cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Telnyx API Connected Status */}
            <div className="pt-0.5 flex items-center justify-between text-[10px] text-[#7d6360]">
              <span className="flex items-center gap-1 text-[#3b110c]">
                <Server className="w-3 h-3 text-[#1f6f43]" />
                <span>Telnyx API: v2</span>
              </span>
              <span className="text-[#1f6f43] font-bold">Connected</span>
            </div>
          </>
        ) : (
          /* Collapsed Mini Timezone Indicator */
          <div className="flex flex-col items-center gap-1 py-1">
            <Globe className="w-3.5 h-3.5 text-[#8b372b]" />
            <span className="text-[9px] font-bold text-[#3b110c]">
              {timezone === 'UTC' ? 'UTC' : timezone.split('/')[1]?.substring(0, 3).toUpperCase() || 'TZ'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
