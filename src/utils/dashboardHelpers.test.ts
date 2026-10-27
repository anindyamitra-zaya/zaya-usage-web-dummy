import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetStatus,
  formatInTimezone,
  aggregateProductBreakdown,
  aggregateHourlyDistribution,
} from './dashboardHelpers';
import { ALL_TELNYX_CALLS } from '../services/telnyxData';

test('calculateBudgetStatus computes normal state correctly', () => {
  const result = calculateBudgetStatus(3.50, 10.00, 80, 20, 31);
  assert.equal(result.monthlyBudget, 10.00);
  assert.equal(result.percentageUsed, 35.0);
  assert.equal(result.remainingBudget, 6.50);
  assert.equal(result.status, 'normal');
  assert.equal(result.isOverBudget, false);
  assert.equal(result.isWarning, false);
  assert.ok(result.projectedMonthEnd > 0);
});

test('calculateBudgetStatus triggers warning when threshold reached', () => {
  const result = calculateBudgetStatus(8.20, 10.00, 80, 25, 31);
  assert.equal(result.status, 'warning');
  assert.equal(result.isWarning, true);
  assert.equal(result.isOverBudget, false);
});

test('calculateBudgetStatus triggers exceeded when spend equals or exceeds budget', () => {
  const result = calculateBudgetStatus(12.50, 10.00, 80, 25, 31);
  assert.equal(result.status, 'exceeded');
  assert.equal(result.isOverBudget, true);
  assert.equal(result.remainingBudget, 0);
});

test('formatInTimezone formats date correctly across timezones', () => {
  const dateStr = '2026-10-01 14:10:00 UTC';
  const utcFormatted = formatInTimezone(dateStr, 'UTC');
  assert.ok(utcFormatted.includes('2026'));

  const estFormatted = formatInTimezone(dateStr, 'America/New_York');
  assert.ok(estFormatted.length > 0);
});

test('aggregateProductBreakdown parses real Telnyx calls into categories', () => {
  const breakdown = aggregateProductBreakdown(ALL_TELNYX_CALLS);
  assert.ok(breakdown.length > 0);
  const totalPct = breakdown.reduce((acc, item) => acc + item.percentage, 0);
  assert.ok(totalPct >= 95 && totalPct <= 105); // Sum should be ~100%
});

test('aggregateHourlyDistribution returns 24 buckets with non-negative counts', () => {
  const buckets = aggregateHourlyDistribution(ALL_TELNYX_CALLS, 'UTC');
  assert.equal(buckets.length, 24);
  const totalCalls = buckets.reduce((acc, b) => acc + b.count, 0);
  assert.equal(totalCalls, ALL_TELNYX_CALLS.length);
});
