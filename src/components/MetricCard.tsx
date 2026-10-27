import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  change?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  icon?: React.ReactNode;
  highlight?: boolean;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  change,
  icon,
  highlight = false,
  tooltip,
}) => {
  return (
    <div
      title={tooltip}
      className={`p-4 rounded-xl transition-all shadow-xs ${
        highlight
          ? 'bg-[#ffffff] border-2 border-[#8b372b] ring-1 ring-[#8b372b]/20'
          : 'bg-[#ffffff] border border-[#e7decb] hover:border-[#dcd3c1]'
      }`}
    >
      <div className="flex items-center justify-between text-xs text-[#5d3d3a] mb-2 font-medium">
        <span className="tracking-tight text-[#5d3d3a]">{label}</span>
        {icon && <span className={highlight ? 'text-[#8b372b]' : 'text-[#7d6360]'}>{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span
          className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${
            highlight ? 'text-[#8b372b]' : 'text-[#3b110c]'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-[#5d3d3a] font-sans">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#ede5d5]">
        {subValue && (
          <span className="text-[#7d6360] font-mono text-[11px] tabular-nums truncate">
            {subValue}
          </span>
        )}

        {change && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-mono tabular-nums ml-auto ${
              change.isPositive ? 'text-[#1f6f43] font-bold' : 'text-[#a05f1a] font-bold'
            }`}
          >
            {change.isPositive ? (
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 shrink-0" />
            )}
            <span>{change.value}</span>
            <span className="text-[#7d6360] font-sans ml-1 text-[10px] font-normal">
              vs {change.period}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
