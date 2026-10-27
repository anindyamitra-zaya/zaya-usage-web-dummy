import React from 'react';
import {
  LayoutDashboard,
  Scale,
  PhoneCall,
  CreditCard,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  ratePerMin: number;
  hasDiscrepancy: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  ratePerMin,
  hasDiscrepancy,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'reconciliation',
      label: 'Audit & Delta',
      icon: <Scale className="w-5 h-5" />,
      badge: hasDiscrepancy,
    },
    {
      id: 'calls',
      label: 'Call Logs',
      icon: <PhoneCall className="w-5 h-5" />,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-xl border-t border-[#e7decb] pb-safe shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#8b372b] font-bold' : 'text-[#7d6360] hover:text-[#3b110c]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#8b372b] rounded-full" />
              )}
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#da1c1c] border-2 border-[#ffffff]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-full font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
