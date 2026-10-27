export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'recorded' | 'pending' | 'unknown';
export type ActiveTab = 'overview' | 'reconciliation' | 'calls' | 'billing';

export interface TelnyxAssistant {
  id: string;
  name: string;
  telnyx_name: string;
  telnyx_assistant_id: string;
  billing_group_id?: string;
  number: string;
  clinic_code: string;
}

export interface TelnyxCharge {
  service: string;
  telnyx_record_id: string;
  source_name: string;
  amount: number | null;
  currency: string;
  cost_status: 'recorded' | 'pending';
  billed_duration_sec: number | null;
  rate: number | null;
  rate_unit: string | null;
}

export interface ProductCostDetail {
  cost: string | null;
  count: number;
  billed_sec: number | null;
  source: 'session_analysis' | 'detail_records';
  included_in_session_total?: boolean;
}

export interface CallBillable {
  source: 'session_analysis' | 'detail_records' | null;
  session_total: string | null;
  partial: boolean;
  total: string | null;
  currency: string;
  billed_sec: number | null;
  rate: string | null;
  rate_measured_in: string | null;
  products: Record<string, ProductCostDetail>;
}

export interface TelnyxCall {
  id: string;
  telnyx_conversation_id: string;
  telnyx_call_session_id: string | null;
  telnyx_call_leg_id: string | null;
  started_at: string;
  assistant_id: string;
  assistant_name: string;
  clinic_name: string;
  clinic_code: string;
  masked_caller: string | null;
  direction: CallDirection;
  duration_sec: number | null;
  billed_sec: number;
  recorded_cost: number | null; // Sum of priced charges for this call
  session_cost_total: number | null; // Telnyx Session Analysis cost.total
  currency: string;
  cost_status: CallStatus;
  charges: TelnyxCharge[];
  billable: CallBillable;
  rate_per_min: number; // Computed cost per minute for this call
  cost_discrepancy: number | null; // session_cost_total vs recorded_cost delta
}

export interface ReconciliationRow {
  product: string;
  label: string;
  currency: string;
  telnyx_cost: number | null; // Cost from Telnyx usage reports
  local_priced_cost: number | null; // Sum of priced local call charges
  pending_charge_count: number;
  delta: number | null; // telnyx_cost - local_priced_cost
  status: 'match' | 'discrepancy' | 'incomplete' | 'usage_report' | 'unavailable';
  note: string;
}

export interface ServiceCostSummary {
  service: string;
  label: string;
  recorded_cost: number | null;
  currency: string;
  pending_charge_count: number;
  charge_count: number;
  billed_sec: number | null;
  cost_per_minute: number | null;
}

export interface DailyUsageRow {
  date: string;
  call_count: number;
  pending_call_count: number;
  duration_sec: number | null;
  billed_sec: number;
  recorded_cost: number | null;
  cost_per_minute: number | null;
}

export interface DiscrepancyAnalysis {
  telnyxGivenTotal: number;
  summationOfCallCosts: number;
  delta: number;
  percentageVariance: number;
  reasons: {
    title: string;
    description: string;
    impactAmount: number;
  }[];
}

export interface DashboardMetrics {
  month: string;
  assistant_id: string | null;
  kpis: {
    call_count: number;
    duration_sec: number | null;
    duration_unknown_count: number;
    billed_sec: number;
    billed_minutes: number;
    recorded_cost: number | null;
    currency: string;
    average_cost_per_call: number | null;
    blended_cost_per_minute: number | null;
    telnyx_session_total_cost: number | null;
    complete_call_count: number;
    pending_call_count: number;
    pending_charge_count: number;
  };
  discrepancy: DiscrepancyAnalysis;
  reconciliation: ReconciliationRow[];
  services: ServiceCostSummary[];
  daily: DailyUsageRow[];
  incomplete: boolean;
  incomplete_reasons: string[];
}

export interface SyncConfig {
  intervalMinutes: number; // e.g. 5
  autoSyncEnabled: boolean;
  lastSyncAt: string | null;
  nextSyncSeconds: number;
  isSyncing: boolean;
  syncRunCount: number;
  lastSyncStats: {
    callsSeen: number;
    chargesSeen: number;
    sessionsFetched: number;
  } | null;
}
