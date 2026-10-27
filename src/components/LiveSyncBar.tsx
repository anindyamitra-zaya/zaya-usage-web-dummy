import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  Radio,
  CheckCircle,
  AlertCircle,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { SyncConfig } from '../types';

interface LiveSyncBarProps {
  syncConfig: SyncConfig;
  onManualSync: () => void;
  onUpdateInterval: (intervalMinutes: number) => void;
  onToggleAutoSync: () => void;
}

export const LiveSyncBar: React.FC<LiveSyncBarProps> = ({
  syncConfig,
  onManualSync,
  onUpdateInterval,
  onToggleAutoSync,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const intervals = [1, 2, 5, 10, 15];

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3 sm:p-4 text-xs shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Live Status Pulse & Sync countdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1f6f43] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1f6f43]"></span>
            </span>
            <span className="font-bold text-[#3b110c]">
              Telnyx Live Sync
            </span>
          </div>

          <span className="text-[#dcd3c1]">|</span>

          {syncConfig.autoSyncEnabled ? (
            <div className="flex items-center gap-1.5 text-[#5d3d3a] font-mono">
              <Clock className="w-3.5 h-3.5 text-[#8b372b]" />
              <span>Next auto-pull:</span>
              <span className="font-bold text-[#3b110c] tabular-nums">
                {formatCountdown(syncConfig.nextSyncSeconds)}
              </span>
              <span className="text-[10px] text-[#7d6360]">
                ({syncConfig.intervalMinutes}m interval)
              </span>
            </div>
          ) : (
            <span className="text-[#a05f1a] font-bold">Auto-sync paused</span>
          )}
        </div>

        {/* Right: Actions, Interval Switcher & Manual Sync */}
        <div className="flex items-center gap-2 flex-wrap">
          {syncConfig.lastSyncAt && (
            <span className="text-[11px] text-[#7d6360] font-mono hidden md:inline">
              Last synced: {syncConfig.lastSyncAt}
            </span>
          )}

          {/* Interval Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#faf8f2] hover:bg-[#f3eedf] text-[#3b110c] border border-[#dcd3c1] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#5d3d3a]" />
              <span className="font-mono font-semibold">{syncConfig.intervalMinutes}m</span>
              <ChevronDown className="w-3 h-3 text-[#5d3d3a]" />
            </button>

            {showConfig && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[#ffffff] border border-[#dcd3c1] p-2 shadow-xl z-30 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#5d3d3a] px-1.5 font-bold">
                  Live Sync Interval
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {intervals.map((int) => (
                    <button
                      key={int}
                      onClick={() => {
                        onUpdateInterval(int);
                        setShowConfig(false);
                      }}
                      className={`px-2 py-1 rounded text-center font-mono cursor-pointer transition-colors ${
                        syncConfig.intervalMinutes === int
                          ? 'bg-[#8b372b] text-[#ffffff] font-bold'
                          : 'bg-[#faf8f2] text-[#3b110c] hover:bg-[#f0ebe0]'
                      }`}
                    >
                      {int}m
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#ede5d5] flex items-center justify-between px-1">
                  <span className="text-[11px] text-[#5d3d3a]">Auto-Pull</span>
                  <button
                    onClick={onToggleAutoSync}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                      syncConfig.autoSyncEnabled
                        ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                        : 'bg-[#faf8f2] text-[#7d6360] border border-[#dcd3c1]'
                    }`}
                  >
                    {syncConfig.autoSyncEnabled ? 'ENABLED' : 'PAUSED'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Now Button in Cinnamon color */}
          <button
            onClick={onManualSync}
            disabled={syncConfig.isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8b372b] hover:bg-[#722b20] text-[#ffffff] font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncConfig.isSyncing ? 'animate-spin' : ''}`}
            />
            <span>{syncConfig.isSyncing ? 'Syncing Telnyx…' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* Sync stats footer */}
      {syncConfig.lastSyncStats && (
        <div className="mt-2.5 pt-2 border-t border-[#ede5d5] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5d3d3a] font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#1f6f43]" />
            <span>
              Telnyx API Response: 200 OK · {syncConfig.lastSyncStats.callsSeen} calls checked · {syncConfig.lastSyncStats.chargesSeen} charges reconciled
            </span>
          </div>
          <span className="text-[#7d6360]">
            Sync Run #{syncConfig.syncRunCount}
          </span>
        </div>
      )}
    </div>
  );
};
