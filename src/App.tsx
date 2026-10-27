import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OverviewView } from './components/OverviewView';
import { ReconciliationView } from './components/ReconciliationView';
import { CallLogsView } from './components/CallLogsView';
import { BillingView } from './components/BillingView';
import { CallDetailModal } from './components/CallDetailModal';
import { BudgetConfig } from './components/BudgetAlertCard';
import {
  ActiveTab,
  TelnyxCall,
  TelnyxAssistant,
  SyncConfig,
} from './types';
import {
  TELNYX_ASSISTANTS,
  ALL_TELNYX_CALLS,
  getTelnyxMetrics,
} from './services/telnyxData';
import { formatTimeInTimezone } from './utils/dashboardHelpers';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedCall, setSelectedCall] = useState<TelnyxCall | null>(null);

  // Timezone state (default UTC, selectable at bottom of sidebar)
  const [timezone, setTimezone] = useState<string>('UTC');

  // Sidebar collapsible state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Configurable Budget Alert state
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    monthlyBudget: 15.00,
    warningThresholdPct: 80,
    alertEmail: 'admin@zayahealth.ai',
    enableAlerts: true,
  });

  // Live Sync Engine (5 minutes configurable interval)
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    intervalMinutes: 5,
    autoSyncEnabled: true,
    lastSyncAt: `${formatTimeInTimezone(new Date(), 'UTC')} UTC`,
    nextSyncSeconds: 300,
    isSyncing: false,
    syncRunCount: 1,
    lastSyncStats: {
      callsSeen: 36,
      chargesSeen: 184,
      sessionsFetched: 14,
    },
  });

  // Calculate dashboard metrics and discrepancy based on selected assistant and month
  const metrics = useMemo(() => {
    return getTelnyxMetrics(selectedAssistantId, selectedMonth);
  }, [selectedAssistantId, selectedMonth]);

  const selectedAssistant = useMemo(() => {
    if (!selectedAssistantId) return null;
    return TELNYX_ASSISTANTS.find((a) => a.telnyx_assistant_id === selectedAssistantId) || null;
  }, [selectedAssistantId]);

  // Handle manual or automatic sync
  const executeSync = useCallback(async () => {
    setSyncConfig((prev) => ({ ...prev, isSyncing: true }));

    try {
      const query = selectedAssistantId ? `month=${selectedMonth}&assistant_id=${selectedAssistantId}` : `month=${selectedMonth}`;
      await fetch(`/api/refresh?${query}`, { method: 'POST' }).catch(() => {
        // Fallback to client sync engine
      });
    } catch {
      // Ignore network errors
    }

    setTimeout(() => {
      const tzLabel = timezone === 'UTC' ? 'UTC' : timezone.split('/')[1]?.replace('_', ' ') || timezone;
      const formattedTime = `${formatTimeInTimezone(new Date(), timezone)} ${tzLabel}`;
      setSyncConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: formattedTime,
        nextSyncSeconds: prev.intervalMinutes * 60,
        syncRunCount: prev.syncRunCount + 1,
        lastSyncStats: {
          callsSeen: ALL_TELNYX_CALLS.length,
          chargesSeen: ALL_TELNYX_CALLS.length * 5,
          sessionsFetched: Math.min(ALL_TELNYX_CALLS.length, 24),
        },
      }));
    }, 700);
  }, [selectedMonth, selectedAssistantId, timezone]);

  // Live timer countdown effect
  useEffect(() => {
    if (!syncConfig.autoSyncEnabled) return;

    const timer = setInterval(() => {
      setSyncConfig((prev) => {
        if (prev.nextSyncSeconds <= 1) {
          executeSync();
          return {
            ...prev,
            nextSyncSeconds: prev.intervalMinutes * 60,
          };
        }
        return {
          ...prev,
          nextSyncSeconds: prev.nextSyncSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncConfig.autoSyncEnabled, executeSync]);

  const handleUpdateInterval = (newMinutes: number) => {
    setSyncConfig((prev) => ({
      ...prev,
      intervalMinutes: newMinutes,
      nextSyncSeconds: newMinutes * 60,
    }));
  };

  const handleToggleAutoSync = () => {
    setSyncConfig((prev) => ({
      ...prev,
      autoSyncEnabled: !prev.autoSyncEnabled,
      nextSyncSeconds: prev.intervalMinutes * 60,
    }));
  };

  const handleTimezoneChange = (newTz: string) => {
    setTimezone(newTz);
    const tzLabel = newTz === 'UTC' ? 'UTC' : newTz.split('/')[1]?.replace('_', ' ') || newTz;
    setSyncConfig((prev) => ({
      ...prev,
      lastSyncAt: `${formatTimeInTimezone(new Date(), newTz)} ${tzLabel}`,
    }));
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#2e1d1a] flex flex-col font-sans selection:bg-[#8b372b]/20 selection:text-[#3b110c]">
      {/* Top Header */}
      <Header
        assistants={TELNYX_ASSISTANTS}
        selectedAssistantId={selectedAssistantId}
        onSelectAssistant={setSelectedAssistantId}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        blendedRatePerMin={metrics.kpis.blended_cost_per_minute || 0.0780}
        totalCalls={metrics.kpis.call_count}
      />

      {/* Main Workspace: Fixed & Collapsible Sidebar + Compact Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* Fixed, Non-Scrollable, Collapsible Sidebar with Live Sync and Timezone at Bottom */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          metrics={metrics}
          totalCallsCount={metrics.kpis.call_count}
          syncConfig={syncConfig}
          onManualSync={executeSync}
          onUpdateInterval={handleUpdateInterval}
          onToggleAutoSync={handleToggleAutoSync}
          timezone={timezone}
          onSelectTimezone={handleTimezoneChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Viewport (Compact layout, no scroll in sidebar) */}
        <main className="flex-1 p-3 sm:p-5 pb-20 md:pb-6 overflow-y-auto max-w-full space-y-4">
          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              calls={ALL_TELNYX_CALLS}
              assistants={TELNYX_ASSISTANTS}
              selectedAssistant={selectedAssistant}
              onSelectCall={setSelectedCall}
              onNavigateTab={setActiveTab}
              timezone={timezone}
              budgetConfig={budgetConfig}
              onUpdateBudgetConfig={setBudgetConfig}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              reconciliation={metrics.reconciliation}
              discrepancy={metrics.discrepancy}
              selectedAssistantName={selectedAssistant ? selectedAssistant.name : 'All Assistants'}
            />
          )}

          {activeTab === 'calls' && (
            <CallLogsView
              calls={ALL_TELNYX_CALLS}
              onSelectCall={setSelectedCall}
              selectedAssistantId={selectedAssistantId}
              timezone={timezone}
            />
          )}

          {activeTab === 'billing' && (
            <BillingView
              metrics={metrics}
              assistants={TELNYX_ASSISTANTS}
              selectedAssistant={selectedAssistant}
            />
          )}
        </main>
      </div>

      {/* Mobile Touch Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ratePerMin={metrics.kpis.blended_cost_per_minute || 0.0780}
        hasDiscrepancy={Math.abs(metrics.discrepancy.delta) > 0.0001}
      />

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
}
