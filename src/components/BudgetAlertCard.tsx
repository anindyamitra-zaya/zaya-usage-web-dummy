import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  DollarSign,
  Mail,
  ChevronDown,
  ChevronUp,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { calculateBudgetStatus } from '../utils/dashboardHelpers';

export interface BudgetConfig {
  monthlyBudget: number;
  warningThresholdPct: number;
  alertEmail: string;
  enableAlerts: boolean;
}

interface BudgetAlertCardProps {
  currentSpend: number;
  config: BudgetConfig;
  onUpdateConfig: (newConfig: BudgetConfig) => void;
}

export const BudgetAlertCard: React.FC<BudgetAlertCardProps> = ({
  currentSpend,
  config,
  onUpdateConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(config.monthlyBudget.toString());
  const [thresholdInput, setThresholdInput] = useState(config.warningThresholdPct.toString());
  const [emailInput, setEmailInput] = useState(config.alertEmail);
  const [alertsEnabled, setAlertsEnabled] = useState(config.enableAlerts);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  const budgetStatus = calculateBudgetStatus(
    currentSpend,
    config.monthlyBudget,
    config.warningThresholdPct,
    22,
    31
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budgetInput) || 10;
    const parsedThreshold = parseInt(thresholdInput, 10) || 80;

    onUpdateConfig({
      monthlyBudget: Math.max(1, parsedBudget),
      warningThresholdPct: Math.min(100, Math.max(10, parsedThreshold)),
      alertEmail: emailInput.trim(),
      enableAlerts: alertsEnabled,
    });

    setShowSaveFeedback(true);
    setTimeout(() => {
      setShowSaveFeedback(false);
      setIsEditing(false);
    }, 1200);
  };

  const getStatusColor = () => {
    if (budgetStatus.isOverBudget) return 'text-[#da1c1c] bg-[#fdf2f2] border-[#f5c6c6]';
    if (budgetStatus.isWarning) return 'text-[#a05f1a] bg-[#fef8ee] border-[#fae2bf]';
    return 'text-[#1f6f43] bg-[#edf7f1] border-[#a8dfc1]';
  };

  const getProgressColor = () => {
    if (budgetStatus.isOverBudget) return 'bg-[#da1c1c]';
    if (budgetStatus.isWarning) return 'bg-[#a05f1a]';
    return 'bg-[#1f6f43]';
  };

  const presetBudgets = [5, 10, 25, 50, 100];

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e7decb] p-3.5 sm:p-4 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              budgetStatus.isOverBudget
                ? 'bg-[#fdf2f2] text-[#da1c1c]'
                : budgetStatus.isWarning
                ? 'bg-[#fef8ee] text-[#a05f1a]'
                : 'bg-[#edf7f1] text-[#1f6f43]'
            }`}
          >
            {budgetStatus.isOverBudget ? (
              <ShieldAlert className="w-4 h-4" />
            ) : budgetStatus.isWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#3b110c]">
                Monthly Telnyx Budget Limit & Spend Alert
              </h3>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${getStatusColor()}`}
              >
                {budgetStatus.isOverBudget
                  ? 'Budget Exceeded'
                  : budgetStatus.isWarning
                  ? `Warning (>=${config.warningThresholdPct}%)`
                  : 'Normal Status'}
              </span>
            </div>
            <p className="text-[11px] text-[#5d3d3a]">
              Configurable threshold tracker with proactive limit warnings and run-rate forecast.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#faf8f2] hover:bg-[#f3eedf] text-[#3b110c] border border-[#dcd3c1] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#8b372b]" />
          <span>{isEditing ? 'Close Settings' : 'Configure Limit'}</span>
          {isEditing ? <ChevronUp className="w-3 h-3 text-[#5d3d3a]" /> : <ChevronDown className="w-3 h-3 text-[#5d3d3a]" />}
        </button>
      </div>

      {/* Progress Bar & Metric Numbers */}
      <div className="p-3 rounded-lg bg-[#faf8f2] border border-[#ede5d5] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="space-x-1.5">
            <span className="text-[#7d6360]">Current Spend:</span>
            <span className="font-bold text-[#3b110c] tabular-nums text-sm">
              ${currentSpend.toFixed(4)}
            </span>
            <span className="text-[#7d6360]">of</span>
            <span className="font-bold text-[#8b372b] tabular-nums text-sm">
              ${config.monthlyBudget.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="font-bold tabular-nums text-[#3b110c]">
              {budgetStatus.percentageUsed.toFixed(1)}%
            </span>
            <span className="text-[#7d6360] text-[10px] ml-1">utilized</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#e8e2d5] overflow-hidden relative">
          <div
            style={{ width: `${Math.min(100, budgetStatus.percentageUsed)}%` }}
            className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
          />
          {/* Warning threshold indicator notch */}
          <div
            style={{ left: `${config.warningThresholdPct}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-[#8b372b]/80"
            title={`Warning threshold: ${config.warningThresholdPct}%`}
          />
        </div>

        {/* Footer projection strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#5d3d3a] pt-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-[#a05f1a]" />
            <span>
              Prorated Month-End Forecast: <strong className="text-[#3b110c]">${budgetStatus.projectedMonthEnd.toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Remaining:{' '}
              <strong className={budgetStatus.remainingBudget > 0 ? 'text-[#1f6f43]' : 'text-[#da1c1c]'}>
                ${budgetStatus.remainingBudget.toFixed(4)}
              </strong>
            </span>
            <span>·</span>
            <span className="text-[#7d6360]">
              Alert Email: {config.alertEmail || 'None configured'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning / Alert Banner when nearing or over limit */}
      {(budgetStatus.isWarning || budgetStatus.isOverBudget) && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
            budgetStatus.isOverBudget
              ? 'bg-[#fdf2f2] border-[#f0c2bd] text-[#da1c1c]'
              : 'bg-[#fef8ee] border-[#fae2bf] text-[#a05f1a]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              {budgetStatus.isOverBudget
                ? `Attention: Monthly Telnyx spend exceeds budget by $${(currentSpend - config.monthlyBudget).toFixed(4)}!`
                : `Notice: Spend has crossed ${config.warningThresholdPct}% of the $${config.monthlyBudget.toFixed(2)} limit.`}
            </span>
            <p className="text-[11px] leading-relaxed text-[#5d3d3a]">
              Recommended action: Audit high-duration reception calls in Call CDR Logs or inspect pending carrier charges.
            </p>
          </div>
        </div>
      )}

      {/* Configuration Drawer */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="pt-2 border-t border-[#ede5d5] space-y-3 text-xs"
        >
          <div className="text-[11px] font-bold text-[#3b110c] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#8b372b]" />
            Configure Monthly Budget & Alert Thresholds
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Monthly Budget Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#5d3d3a] font-medium block">
                Monthly Budget Limit ($)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7d6360]" />
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-[#faf8f2] border border-[#dcd3c1] rounded-lg text-[#3b110c] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#8b372b]"
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1 pt-1">
                {presetBudgets.map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setBudgetInput(val.toString())}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                      budgetInput === val.toString()
                        ? 'bg-[#8b372b] text-white font-bold'
                        : 'bg-[#faf8f2] text-[#5d3d3a] hover:bg-[#ede5d5]'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning Threshold Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#5d3d3a]">
                <label className="font-medium">Warning Threshold (%)</label>
                <span className="font-mono font-bold text-[#3b110c]">{thresholdInput}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-full accent-[#8b372b] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#7d6360] font-mono">
                <span>50%</span>
                <span>75%</span>
                <span>90%</span>
              </div>
            </div>

            {/* Alert Email */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#5d3d3a] font-medium block">
                Notification Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7d6360]" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@zayahealth.ai"
                  className="w-full pl-7 pr-3 py-1.5 bg-[#faf8f2] border border-[#dcd3c1] rounded-lg text-[#3b110c] text-xs focus:outline-none focus:ring-1 focus:ring-[#8b372b]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="enableAlertsCheckbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                  className="rounded border-[#dcd3c1] text-[#8b372b] accent-[#8b372b] cursor-pointer"
                />
                <label htmlFor="enableAlertsCheckbox" className="text-[11px] text-[#5d3d3a] cursor-pointer">
                  Send email & in-app alerts
                </label>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#7d6360] font-mono">
              Changes apply immediately to real-time spend calculations.
            </span>

            <div className="flex items-center gap-2">
              {showSaveFeedback && (
                <span className="text-xs font-mono font-bold text-[#1f6f43]">
                  Budget settings updated!
                </span>
              )}

              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#8b372b] hover:bg-[#722b20] text-white transition-colors cursor-pointer shadow-xs"
              >
                Save Budget Limit
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
