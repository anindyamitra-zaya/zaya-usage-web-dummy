import React from 'react';
import {
  Activity,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { TelnyxAssistant } from '../types';

interface HeaderProps {
  assistants: TelnyxAssistant[];
  selectedAssistantId: string | null;
  onSelectAssistant: (id: string | null) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  blendedRatePerMin: number;
  totalCalls: number;
}

export const Header: React.FC<HeaderProps> = ({
  assistants,
  selectedAssistantId,
  onSelectAssistant,
  selectedMonth,
  onSelectMonth,
  blendedRatePerMin,
  totalCalls,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e7decb] px-3 sm:px-6 py-2.5 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b110c] flex items-center justify-center text-[#f8eed2] shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#3b110c]">
                  ZAYA
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b110c] bg-[#f8eed2] border border-[#e8dfce] px-1.5 py-0.5 rounded font-semibold">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-[#5d3d3a] hidden sm:block">
                Telnyx AI Telephony & Per-Minute Usage Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Assistant Selector & Month & Rate Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Assistant Selector */}
          <div className="relative">
            <select
              value={selectedAssistantId || ''}
              onChange={(e) => onSelectAssistant(e.target.value || null)}
              className="h-8.5 px-3 py-1 text-xs font-medium rounded-lg bg-[#faf8f2] border border-[#dcd3c1] text-[#3b110c] hover:border-[#8b372b] focus:outline-none focus:ring-1 focus:ring-[#8b372b] cursor-pointer transition-colors shadow-2xs"
            >
              <option value="">All Voice Assistants ({assistants.length})</option>
              {assistants.map((ast) => (
                <option key={ast.telnyx_assistant_id} value={ast.telnyx_assistant_id}>
                  {ast.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="h-8.5 px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-[#faf8f2] border border-[#dcd3c1] text-[#3b110c] hover:border-[#8b372b] focus:outline-none focus:ring-1 focus:ring-[#8b372b] cursor-pointer transition-colors shadow-2xs"
            >
              <option value="2026-10">Oct 2026 (Open)</option>
              <option value="2026-09">Sep 2026 (Closed)</option>
            </select>
          </div>

          {/* Per-Minute Cost Pill in Light Theme */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f8eed2] border border-[#e5d9bd] text-xs shrink-0 font-mono text-[#3b110c]">
            <DollarSign className="w-3.5 h-3.5 text-[#8b372b] shrink-0" />
            <span className="text-[#5d3d3a] hidden sm:inline">Rate:</span>
            <span className="font-bold text-[#3b110c] tabular-nums">
              ${blendedRatePerMin.toFixed(4)}
            </span>
            <span className="text-[10px] text-[#5d3d3a]">/ min</span>
          </div>
        </div>
      </div>
    </header>
  );
};
