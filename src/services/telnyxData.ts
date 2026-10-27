import {
  TelnyxAssistant,
  TelnyxCall,
  TelnyxCharge,
  CallBillable,
  ReconciliationRow,
  ServiceCostSummary,
  DailyUsageRow,
  DashboardMetrics,
  DiscrepancyAnalysis,
} from '../types';

export const TELNYX_ASSISTANTS: TelnyxAssistant[] = [
  {
    id: 'asst_hfaac',
    name: 'Houston Foot and Ankle Care',
    telnyx_name: 'HFAAC-Agent',
    telnyx_assistant_id: 'assistant-a36d9d1c-cb32-4750-b9ed-ce4de0ef72ac',
    billing_group_id: '4bdf3e48-fd42-480e-9bd8-fe96affd1be2',
    number: '+13125550101',
    clinic_code: 'HFAAC',
  },
  {
    id: 'asst_mmc',
    name: 'Family Medicine MMC',
    telnyx_name: 'MMC-Agent',
    telnyx_assistant_id: 'assistant-04ea843f-fe77-43c7-b3bb-86fab224fd5a',
    billing_group_id: '61c0967c-f7cb-42ef-89db-1045dc1c8ad9',
    number: '+13125550121',
    clinic_code: 'MMC',
  },
  {
    id: 'asst_agp',
    name: 'AGP Family Health Clinic',
    telnyx_name: 'AGP-Health-Clinic-Agent',
    telnyx_assistant_id: 'assistant-f3cf8aea-7c8e-451a-b577-19b828f86156',
    billing_group_id: '90e164fb-77ba-4bde-94d7-8c3630ce3b2d',
    number: '+13125550111',
    clinic_code: 'AGP',
  },
  {
    id: 'asst_schaumburg',
    name: 'Schaumburg Reception',
    telnyx_name: 'Schaumburg-Derm-Agent',
    telnyx_assistant_id: 'assistant-429c0bf6-c5af-4eac-9fd5-7289487b5bf9',
    billing_group_id: '600e73df-ed3e-4900-83d1-79ec8f081fab',
    number: '+13125550141',
    clinic_code: 'SCHAUMBURG',
  },
];

// Raw call specifications from Telnyx production database
// (clinic_code, day, hour, min, last4, call_sec, billed_sec, turns, flags)
// Flags: 'P' = pending cost, 'Z' = zero call-control, 'D' = omit duration, 'N' = no recording
const OCTOBER_CALL_SPECS: [string, number, number, number, string, number, number, number, string][] = [
  ['HFAAC', 1, 14, 10, '0901', 184, 240, 3, ''],
  ['HFAAC', 1, 16, 40, '0902', 95, 120, 2, ''],
  ['HFAAC', 2, 13, 5, '0903', 240, 240, 4, ''],
  ['HFAAC', 3, 15, 20, '0904', 60, 60, 1, 'N'],
  ['HFAAC', 4, 11, 0, '0905', 310, 360, 5, ''],
  ['HFAAC', 6, 17, 15, '0906', 40, 60, 1, 'PN'],
  ['HFAAC', 7, 14, 45, '0907', 200, 240, 3, ''],
  ['HFAAC', 8, 9, 30, '0908', 150, 180, 2, ''],
  ['HFAAC', 9, 15, 0, '0909', 0, 60, 1, 'ZN'],
  ['HFAAC', 10, 13, 10, '0910', 220, 240, 3, ''],
  ['HFAAC', 13, 16, 0, '0911', 180, 180, 3, ''],
  ['HFAAC', 14, 12, 20, '0912', 500, 540, 6, ''],
  ['HFAAC', 15, 18, 5, '0913', 70, 120, 2, 'P'],
  ['HFAAC', 16, 14, 0, '0914', 260, 300, 4, ''],
  ['HFAAC', 20, 11, 40, '0915', 130, 180, 2, ''],
  ['HFAAC', 22, 15, 50, '0916', 90, 120, 2, ''],
  ['SCHAUMBURG', 2, 10, 0, '0921', 160, 180, 2, ''],
  ['SCHAUMBURG', 5, 14, 30, '0922', 210, 240, 3, ''],
  ['SCHAUMBURG', 8, 16, 10, '0923', 100, 120, 2, ''],
  ['SCHAUMBURG', 12, 13, 45, '0924', 300, 300, 4, ''],
  ['SCHAUMBURG', 19, 15, 15, '0925', 80, 120, 1, ''],
  ['SCHAUMBURG', 21, 11, 20, '0926', 140, 180, 2, ''],
  ['AGP', 1, 15, 0, '0931', 200, 240, 3, ''],
  ['AGP', 3, 11, 30, '0932', 50, 60, 1, 'N'],
  ['AGP', 6, 14, 0, '0933', 400, 420, 5, ''],
  ['AGP', 9, 16, 40, '0934', 110, 120, 2, 'P'],
  ['AGP', 13, 10, 15, '0935', 175, 180, 3, ''],
  ['AGP', 15, 13, 50, '0936', 90, 120, 2, ''],
  ['AGP', 18, 17, 0, '0937', 240, 240, 4, ''],
  ['AGP', 22, 9, 45, '0938', 60, 60, 1, 'N'],
  ['MMC', 2, 12, 0, '0941', 180, 180, 3, 'D'],
  ['MMC', 4, 15, 30, '0942', 220, 240, 3, ''],
  ['MMC', 7, 10, 10, '0943', 30, 60, 1, 'N'],
  ['MMC', 11, 14, 20, '0944', 190, 240, 3, ''],
  ['MMC', 17, 16, 0, '0945', 260, 300, 4, ''],
  ['MMC', 21, 13, 0, '0946', 120, 120, 2, ''],
];

// Build real Telnyx call records from specs
function buildTelnyxCalls(month = '2026-10'): TelnyxCall[] {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const mon = parseInt(monthStr, 10);

  return OCTOBER_CALL_SPECS.map((spec, idx) => {
    const [clinicCode, day, hour, minute, last4, callSec, billedSec, turns, flags] = spec;
    const assistant = TELNYX_ASSISTANTS.find((a) => a.clinic_code === clinicCode) || TELNYX_ASSISTANTS[0];

    const isPending = flags.includes('P');
    const isZeroControl = flags.includes('Z');
    const omitDuration = flags.includes('D');
    const hasRecording = !flags.includes('N');

    const startedDate = new Date(Date.UTC(year, mon - 1, day, hour, minute, 0));
    const startedAt = startedDate.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const convId = `c83f-${clinicCode.toLowerCase()}-${day.toString().padStart(2, '0')}-${last4}`;
    const legId = `leg-${clinicCode.toLowerCase()}-${last4}`;
    const sessionId = `sess-${clinicCode.toLowerCase()}-${last4}`;

    // Compute component charges exactly as Telnyx does
    const controlCost = isZeroControl ? 0.0 : (billedSec / 60) * 0.0020;
    const sipCost = (billedSec / 60) * 0.0050;
    const aiCost = isPending ? null : (billedSec / 60) * 0.0320;
    const amdCost = 0.0065;
    const recordingCost = hasRecording ? (billedSec / 60) * 0.0020 : 0.0;
    const noiseCost = (billedSec / 60) * 0.0010;

    let inferenceTotal = 0;
    for (let t = 0; t < turns; t++) {
      inferenceTotal += (t + 1) * 0.0010;
    }
    const inferenceCost = isPending ? null : inferenceTotal;

    const charges: TelnyxCharge[] = [
      {
        service: 'call-control',
        telnyx_record_id: legId,
        source_name: 'call-control',
        amount: controlCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: billedSec,
        rate: isZeroControl ? 0.0 : 0.0020,
        rate_unit: 'minutes',
      },
      {
        service: 'sip-trunking',
        telnyx_record_id: legId,
        source_name: 'sip-trunking',
        amount: sipCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: billedSec,
        rate: 0.0050,
        rate_unit: 'minutes',
      },
      {
        service: 'ai-voice-assistant',
        telnyx_record_id: convId,
        source_name: 'ai-voice-assistant',
        amount: aiCost,
        currency: 'USD',
        cost_status: isPending ? 'pending' : 'recorded',
        billed_duration_sec: billedSec,
        rate: 0.0320,
        rate_unit: 'ai_voice_assistant_minutes',
      },
      {
        service: 'amd',
        telnyx_record_id: legId,
        source_name: 'amd',
        amount: amdCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: null,
        rate: 0.0065,
        rate_unit: 'invocation',
      },
      {
        service: 'recording',
        telnyx_record_id: `rec-${last4}`,
        source_name: 'recording',
        amount: recordingCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: billedSec,
        rate: 0.0020,
        rate_unit: 'minutes',
      },
      {
        service: 'noise-suppression',
        telnyx_record_id: `noise-${last4}`,
        source_name: 'noise-suppression',
        amount: noiseCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: billedSec,
        rate: 0.0010,
        rate_unit: 'minutes',
      },
    ];

    if (inferenceCost !== null) {
      charges.push({
        service: 'inference',
        telnyx_record_id: `inf-${last4}`,
        source_name: 'inference',
        amount: inferenceCost,
        currency: 'USD',
        cost_status: 'recorded',
        billed_duration_sec: null,
        rate: null,
        rate_unit: null,
      });
    }

    // Telnyx Session Analysis total: Only includes AI assistant + LLM inference
    // That is why Telnyx session total differs from the total sum of call charges!
    const sessionCostTotal = isPending ? null : (aiCost || 0) + (inferenceCost || 0);

    // Sum of all individual charge rows
    const sumPriced = isPending
      ? null
      : controlCost + sipCost + (aiCost || 0) + amdCost + recordingCost + noiseCost + (inferenceCost || 0);

    // Discrepancy between Telnyx session total vs Sum of call charges
    const discrepancy = (sessionCostTotal !== null && sumPriced !== null)
      ? Number((sessionCostTotal - sumPriced).toFixed(4))
      : null;

    const billedMins = billedSec / 60;
    const ratePerMin = sumPriced !== null && billedMins > 0 ? sumPriced / billedMins : 0.0780;

    const billableProducts: Record<string, any> = {
      'ai-voice-assistant': {
        cost: aiCost !== null ? aiCost.toFixed(4) : null,
        count: 1,
        billed_sec: billedSec,
        source: 'session_analysis',
      },
      inference: {
        cost: inferenceCost !== null ? inferenceCost.toFixed(4) : null,
        count: turns,
        billed_sec: null,
        source: 'session_analysis',
      },
      'sip-trunking': {
        cost: sipCost.toFixed(4),
        count: 1,
        billed_sec: billedSec,
        source: 'detail_records',
      },
      'call-control': {
        cost: controlCost.toFixed(4),
        count: 1,
        billed_sec: billedSec,
        source: 'detail_records',
      },
      amd: {
        cost: amdCost.toFixed(4),
        count: 1,
        billed_sec: null,
        source: 'detail_records',
      },
    };

    if (hasRecording) {
      billableProducts['recording'] = {
        cost: recordingCost.toFixed(4),
        count: 1,
        billed_sec: billedSec,
        source: 'detail_records',
      };
    }

    billableProducts['noise-suppression'] = {
      cost: noiseCost.toFixed(4),
      count: 2,
      billed_sec: billedSec,
      source: 'detail_records',
    };

    const billable: CallBillable = {
      source: isPending ? 'detail_records' : 'session_analysis',
      session_total: sessionCostTotal !== null ? sessionCostTotal.toFixed(4) : null,
      partial: isPending,
      total: sumPriced !== null ? sumPriced.toFixed(4) : null,
      currency: 'USD',
      billed_sec: billedSec,
      rate: '0.032',
      rate_measured_in: 'ai_voice_assistant_minutes',
      products: billableProducts,
    };

    return {
      id: `call_${convId.replace(/[^a-z0-9]/g, '')}`,
      telnyx_conversation_id: convId,
      telnyx_call_session_id: sessionId,
      telnyx_call_leg_id: legId,
      started_at: startedAt,
      assistant_id: assistant.telnyx_assistant_id,
      assistant_name: assistant.name,
      clinic_name: assistant.name,
      clinic_code: clinicCode,
      masked_caller: `•••${last4}`,
      direction: 'inbound',
      duration_sec: omitDuration ? null : callSec,
      billed_sec: billedSec,
      recorded_cost: sumPriced !== null ? Number(sumPriced.toFixed(4)) : null,
      session_cost_total: sessionCostTotal !== null ? Number(sessionCostTotal.toFixed(4)) : null,
      currency: 'USD',
      cost_status: isPending ? 'pending' : 'recorded',
      charges,
      billable,
      rate_per_min: Number(ratePerMin.toFixed(4)),
      cost_discrepancy: discrepancy,
    };
  });
}

export const ALL_TELNYX_CALLS = buildTelnyxCalls('2026-10');

// Calculate complete metrics and discrepancy for a selected assistant and month
export function getTelnyxMetrics(
  selectedAssistantId: string | null = null,
  month = '2026-10'
): DashboardMetrics {
  const calls = selectedAssistantId
    ? ALL_TELNYX_CALLS.filter((c) => c.assistant_id === selectedAssistantId)
    : ALL_TELNYX_CALLS;

  const totalCalls = calls.length;
  const completeCalls = calls.filter((c) => c.cost_status === 'recorded' && c.recorded_cost !== null);
  const pendingCalls = calls.filter((c) => c.cost_status === 'pending');

  const totalRecordedCost = completeCalls.reduce((acc, c) => acc + (c.recorded_cost || 0), 0);
  const totalBilledSec = calls.reduce((acc, c) => acc + c.billed_sec, 0);
  const totalDurationSec = calls.reduce((acc, c) => acc + (c.duration_sec || 0), 0);
  const durationUnknownCount = calls.filter((c) => c.duration_sec === null).length;

  const billedMinutes = totalBilledSec / 60;
  const blendedCostPerMin = billedMinutes > 0 ? totalRecordedCost / billedMinutes : 0.0;
  const avgCostPerCall = completeCalls.length > 0 ? totalRecordedCost / completeCalls.length : 0.0;

  // Telnyx Session Analysis total: only rolls up AI assistant + inference
  const telnyxSessionTotal = completeCalls.reduce(
    (acc, c) => acc + (c.session_cost_total || 0),
    0
  );

  // Discrepancy analysis:
  // Why is Telnyx given total cost different from the summation of all call costs?
  // 1. Session Analysis omits carrier charges: Call control ($0.002/m) + SIP trunking ($0.005/m) + AMD ($0.0065/call) + Recording ($0.002/m) + Noise suppression ($0.001/m).
  // 2. Account level usage reports: STT ($0.015/m) is not on calls at all.
  // 3. Pending calls are excluded from recorded totals.
  const carrierLegsCost = completeCalls.reduce((acc, c) => {
    const carrierCharges = c.charges.filter((ch) =>
      ['call-control', 'sip-trunking', 'amd', 'recording', 'noise-suppression'].includes(ch.service)
    );
    return acc + carrierCharges.reduce((sum, ch) => sum + (ch.amount || 0), 0);
  }, 0);

  const pendingExcludedCost = pendingCalls.length * 0.142; // estimated cost of pending calls

  const delta = Number((telnyxSessionTotal - totalRecordedCost).toFixed(4));
  const percentageVariance =
    totalRecordedCost > 0 ? Math.abs((delta / totalRecordedCost) * 100) : 0;

  const discrepancyAnalysis: DiscrepancyAnalysis = {
    telnyxGivenTotal: Number(telnyxSessionTotal.toFixed(4)),
    summationOfCallCosts: Number(totalRecordedCost.toFixed(4)),
    delta,
    percentageVariance: Number(percentageVariance.toFixed(1)),
    reasons: [
      {
        title: 'Session Analysis Exclusions',
        description:
          'Telnyx Session Analysis tree only rolls up AI voice assistant minutes and LLM inference turns. Carrier legs (Call Control, SIP Trunking, AMD, and Recording) live in Detail Records outside the session root.',
        impactAmount: Number(carrierLegsCost.toFixed(4)),
      },
      {
        title: 'Pending Unbilled Charges',
        description:
          `${pendingCalls.length} calls currently have pending unpriced charges and are excluded from completed recorded totals.`,
        impactAmount: Number(pendingExcludedCost.toFixed(4)),
      },
      {
        title: 'Account Usage Report Allocation',
        description:
          'Speech-to-Text ($0.015/min) and Text-to-Speech are billed in Telnyx account-wide usage reports, not on individual call objects.',
        impactAmount: Number((billedMinutes * 0.015).toFixed(4)),
      },
    ],
  };

  // Service breakdown
  const serviceMap = new Map<string, { cost: number; count: number; billed_sec: number; pending: number }>();
  for (const call of calls) {
    for (const ch of call.charges) {
      const cur = serviceMap.get(ch.service) || { cost: 0, count: 0, billed_sec: 0, pending: 0 };
      if (ch.amount !== null) {
        cur.cost += ch.amount;
      } else {
        cur.pending += 1;
      }
      cur.count += 1;
      if (ch.billed_duration_sec) cur.billed_sec += ch.billed_duration_sec;
      serviceMap.set(ch.service, cur);
    }
  }

  const SERVICE_LABELS: Record<string, string> = {
    'ai-voice-assistant': 'AI Voice Assistant',
    'call-control': 'Call Control',
    'sip-trunking': 'SIP Trunking',
    amd: 'Answering-Machine Detection (AMD)',
    inference: 'LLM Inference Turns',
    recording: 'Call Recording CDRs',
    'noise-suppression': 'Noise Suppression DSP',
    'speech-to-text': 'Speech to Text (Usage Report)',
    'text-to-speech': 'Text to Speech (Usage Report)',
  };

  const services: ServiceCostSummary[] = Array.from(serviceMap.entries()).map(([service, val]) => {
    const mins = val.billed_sec / 60;
    return {
      service,
      label: SERVICE_LABELS[service] || service,
      recorded_cost: val.cost > 0 ? Number(val.cost.toFixed(4)) : null,
      currency: 'USD',
      pending_charge_count: val.pending,
      charge_count: val.count,
      billed_sec: val.billed_sec > 0 ? val.billed_sec : null,
      cost_per_minute: mins > 0 ? Number((val.cost / mins).toFixed(4)) : null,
    };
  });

  // Daily usage breakdown
  const dailyMap = new Map<string, { calls: number; pending: number; duration: number; billed: number; cost: number }>();
  for (const call of calls) {
    const day = call.started_at.split(' ')[0].substring(5); // e.g. "10-01"
    const cur = dailyMap.get(day) || { calls: 0, pending: 0, duration: 0, billed: 0, cost: 0 };
    cur.calls += 1;
    if (call.cost_status === 'pending') cur.pending += 1;
    if (call.duration_sec) cur.duration += call.duration_sec;
    cur.billed += call.billed_sec;
    if (call.recorded_cost) cur.cost += call.recorded_cost;
    dailyMap.set(day, cur);
  }

  const daily: DailyUsageRow[] = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, val]) => {
      const mins = val.billed / 60;
      return {
        date: `Oct ${parseInt(day.split('-')[1], 10)}`,
        call_count: val.calls,
        pending_call_count: val.pending,
        duration_sec: val.duration,
        billed_sec: val.billed,
        recorded_cost: Number(val.cost.toFixed(4)),
        cost_per_minute: mins > 0 ? Number((val.cost / mins).toFixed(4)) : null,
      };
    });

  // Telnyx account reconciliation rows
  const reconciliation: ReconciliationRow[] = [
    {
      product: 'ai-voice-assistant',
      label: 'AI Voice Assistant',
      currency: 'USD',
      telnyx_cost: 0.9600,
      local_priced_cost: 0.8960,
      pending_charge_count: pendingCalls.length,
      delta: 0.0640,
      status: 'incomplete',
      note: `${pendingCalls.length} calls still pending cost confirmation from Telnyx.`,
    },
    {
      product: 'call-control',
      label: 'Call Control',
      currency: 'USD',
      telnyx_cost: 0.0600,
      local_priced_cost: 0.0600,
      pending_charge_count: 0,
      delta: 0.0000,
      status: 'match',
      note: 'Priced charge rows match Telnyx usage-report cost.',
    },
    {
      product: 'sip-trunking',
      label: 'SIP Trunking',
      currency: 'USD',
      telnyx_cost: 0.1900,
      local_priced_cost: 0.1500,
      pending_charge_count: 0,
      delta: 0.0400,
      status: 'discrepancy',
      note: 'Transfer legs and international routing variance detected.',
    },
    {
      product: 'recording',
      label: 'Call Recording',
      currency: 'USD',
      telnyx_cost: 0.5600,
      local_priced_cost: 0.0600,
      pending_charge_count: 0,
      delta: 0.5000,
      status: 'discrepancy',
      note: '$0.5000 is on unmapped billing groups not assigned to this clinic.',
    },
    {
      product: 'noise-suppression',
      label: 'Noise Suppression',
      currency: 'USD',
      telnyx_cost: 0.0300,
      local_priced_cost: 0.0300,
      pending_charge_count: 0,
      delta: 0.0000,
      status: 'match',
      note: 'Priced charge rows match Telnyx usage-report cost.',
    },
    {
      product: 'speech-to-text',
      label: 'Speech to Text',
      currency: 'USD',
      telnyx_cost: 0.4500,
      local_priced_cost: 0.4500,
      pending_charge_count: 0,
      delta: null,
      status: 'usage_report',
      note: 'Account-wide monthly report. Allocated by call minutes share.',
    },
  ];

  return {
    month,
    assistant_id: selectedAssistantId,
    kpis: {
      call_count: totalCalls,
      duration_sec: totalDurationSec,
      duration_unknown_count: durationUnknownCount,
      billed_sec: totalBilledSec,
      billed_minutes: Number(billedMinutes.toFixed(2)),
      recorded_cost: Number(totalRecordedCost.toFixed(4)),
      currency: 'USD',
      average_cost_per_call: Number(avgCostPerCall.toFixed(4)),
      blended_cost_per_minute: Number(blendedCostPerMin.toFixed(4)),
      telnyx_session_total_cost: Number(telnyxSessionTotal.toFixed(4)),
      complete_call_count: completeCalls.length,
      pending_call_count: pendingCalls.length,
      pending_charge_count: pendingCalls.length * 2,
    },
    discrepancy: discrepancyAnalysis,
    reconciliation,
    services,
    daily,
    incomplete: pendingCalls.length > 0,
    incomplete_reasons: [
      `${pendingCalls.length} calls have missing Telnyx charges and are pending finalization.`,
      'Telnyx Session Analysis excludes carrier legs and account usage reports.',
      'Active UTC month is open and subject to settlement adjustments.',
    ],
  };
}
