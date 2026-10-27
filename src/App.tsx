import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LiveSyncBar } from './components/LiveSyncBar';
import { OverviewView } from './components/OverviewView';
import { ReconciliationView } from './components/ReconciliationView';
import { CallLogsView } from './components/CallLogsView';
import { BillingView } from './components/BillingView';
import { CallDetailModal } from './components/CallDetailModal';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedCall, setSelectedCall] = useState<TelnyxCall | null>(null);

  // Live Sync Engine (5 minutes configurable interval)
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    intervalMinutes: 5,
    autoSyncEnabled: true,
    lastSyncAt: new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
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
      const nowUtc = new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
      setSyncConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: nowUtc,
        nextSyncSeconds: prev.intervalMinutes * 60,
        syncRunCount: prev.syncRunCount + 1,
        lastSyncStats: {
          callsSeen: ALL_TELNYX_CALLS.length,
          chargesSeen: ALL_TELNYX_CALLS.length * 5,
          sessionsFetched: Math.min(ALL_TELNYX_CALLS.length, 24),
        },
      }));
    }, 700);
  }, [selectedMonth, selectedAssistantId]);

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

  const hasDiscrepancy = Math.abs(metrics.discrepancy.delta) > 0.0001;

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

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          metrics={metrics}
          totalCallsCount={metrics.kpis.call_count}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto max-w-full space-y-5">
          {/* Live Sync Bar */}
          <LiveSyncBar
            syncConfig={syncConfig}
            onManualSync={executeSync}
            onUpdateInterval={handleUpdateInterval}
            onToggleAutoSync={handleToggleAutoSync}
          />

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              calls={ALL_TELNYX_CALLS}
              assistants={TELNYX_ASSISTANTS}
              selectedAssistant={selectedAssistant}
              onSelectCall={setSelectedCall}
              onNavigateTab={setActiveTab}
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
        hasDiscrepancy={hasDiscrepancy}
      />

      {/* Deep-Dive Call Detail Modal (NO audio inspection) */}
      <CallDetailModal
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
}
