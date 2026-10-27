import { DailyUsageRow, TelnyxCall } from '../types';

export interface BudgetStatus {
  monthlyBudget: number;
  currentSpend: number;
  warningThresholdPct: number;
  percentageUsed: number;
  remainingBudget: number;
  status: 'normal' | 'warning' | 'exceeded';
  projectedMonthEnd: number;
  isOverBudget: boolean;
  isWarning: boolean;
}

/**
 * Format a UTC ISO or date string into a localized time or date string
 * using the specified timezone.
 */
export function formatInTimezone(
  dateInput: string | Date,
  timezone: string = 'UTC',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput.replace(' UTC', 'Z')) : dateInput;
    if (isNaN(date.getTime())) {
      return String(dateInput);
    }

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, timeZone: timezone }).format(date);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format time of day for sync display e.g. "03:06:07 PM"
 */
export function formatTimeInTimezone(date: Date, timezone: string = 'UTC'): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toUTCString();
  }
}

/**
 * Calculate budget status and run-rate projections
 */
export function calculateBudgetStatus(
  currentSpend: number,
  monthlyBudget: number,
  warningThresholdPct: number = 80,
  dayOfMonth: number = 22,
  daysInMonth: number = 31
): BudgetStatus {
  const safeBudget = monthlyBudget > 0 ? monthlyBudget : 10;
  const percentageUsed = Math.min(999, Math.round((currentSpend / safeBudget) * 1000) / 10);
  const remainingBudget = Math.max(0, safeBudget - currentSpend);

  const safeDay = Math.max(1, Math.min(daysInMonth, dayOfMonth));
  const dailyRunRate = currentSpend / safeDay;
  const projectedMonthEnd = Math.round(dailyRunRate * daysInMonth * 100) / 100;

  const isOverBudget = currentSpend >= safeBudget;
  const isWarning = !isOverBudget && percentageUsed >= warningThresholdPct;

  let status: 'normal' | 'warning' | 'exceeded' = 'normal';
  if (isOverBudget) {
    status = 'exceeded';
  } else if (isWarning) {
    status = 'warning';
  }

  return {
    monthlyBudget: safeBudget,
    currentSpend,
    warningThresholdPct,
    percentageUsed,
    remainingBudget,
    status,
    projectedMonthEnd,
    isOverBudget,
    isWarning,
  };
}

/**
 * Aggregates product cost composition from Telnyx calls
 */
export interface ProductBreakdownItem {
  name: string;
  category: 'ai' | 'stt' | 'sip' | 'amd' | 'recording';
  cost: number;
  percentage: number;
  color: string;
}

export function aggregateProductBreakdown(calls: TelnyxCall[]): ProductBreakdownItem[] {
  let aiTotal = 0;
  let sipTotal = 0;
  let sttTotal = 0;
  let amdTotal = 0;
  let recTotal = 0;

  for (const call of calls) {
    for (const charge of call.charges) {
      const amount = charge.amount || 0;
      const svc = charge.service.toLowerCase();
      if (svc.includes('assistant') || svc.includes('ai')) {
        aiTotal += amount;
      } else if (svc.includes('sip') || svc.includes('trunking') || svc.includes('voice')) {
        sipTotal += amount;
      } else if (svc.includes('stt') || svc.includes('transcription')) {
        sttTotal += amount;
      } else if (svc.includes('amd') || svc.includes('answering')) {
        amdTotal += amount;
      } else if (svc.includes('recording')) {
        recTotal += amount;
      } else {
        sipTotal += amount;
      }
    }
  }

  const grandTotal = aiTotal + sipTotal + sttTotal + amdTotal + recTotal || 1;

  const items: ProductBreakdownItem[] = [
    {
      name: 'AI Voice Assistant',
      category: 'ai',
      cost: aiTotal,
      percentage: Math.round((aiTotal / grandTotal) * 1000) / 10,
      color: '#8b372b', // Cinnamon
    },
    {
      name: 'Speech-to-Text (STT)',
      category: 'stt',
      cost: sttTotal,
      percentage: Math.round((sttTotal / grandTotal) * 1000) / 10,
      color: '#a05f1a', // Coffee
    },
    {
      name: 'SIP Trunking & Legs',
      category: 'sip',
      cost: sipTotal,
      percentage: Math.round((sipTotal / grandTotal) * 1000) / 10,
      color: '#3b110c', // Chocolate
    },
    {
      name: 'Answering Machine (AMD)',
      category: 'amd',
      cost: amdTotal,
      percentage: Math.round((amdTotal / grandTotal) * 1000) / 10,
      color: '#dd5013', // Sunset Orange
    },
    {
      name: 'Call Audio Recording',
      category: 'recording',
      cost: recTotal,
      percentage: Math.round((recTotal / grandTotal) * 1000) / 10,
      color: '#1f6f43', // Forest green
    },
  ];

  return items.sort((a, b) => b.cost - a.cost);
}

/**
 * Hourly distribution of calls adjusted to given timezone
 */
export interface HourlyCallBucket {
  hour: number;
  label: string;
  count: number;
  cost: number;
}

export function aggregateHourlyDistribution(calls: TelnyxCall[], timezone: string = 'UTC'): HourlyCallBucket[] {
  const buckets: HourlyCallBucket[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h === 0 ? '12' : h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`,
    count: 0,
    cost: 0,
  }));

  for (const call of calls) {
    try {
      const date = new Date(call.started_at.replace(' UTC', 'Z'));
      const localizedHourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }).format(date);
      const h = parseInt(localizedHourStr, 10) % 24;
      if (!isNaN(h) && buckets[h]) {
        buckets[h].count += 1;
        buckets[h].cost += call.recorded_cost || 0;
      }
    } catch {
      // Fallback
    }
  }

  return buckets;
}
