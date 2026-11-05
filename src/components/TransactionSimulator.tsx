import React, { useState, useMemo } from 'react';
import { PRESET_TRANSACTIONS } from '../data/presetTransactions';
import { Transaction } from '../types/fraud';
import { scoreAllModels, computeShapAttribution } from '../utils/mlEngine';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';

export const TransactionSimulator: React.FC = () => {
  const [selectedTxId, setSelectedTxId] = useState<string>(PRESET_TRANSACTIONS[0].id);
  const [threshold, setThreshold] = useState<number>(0.22); // Optimal threshold as default

  // Custom editable state initialized from current selected preset
  const activePreset = useMemo(() => {
    return PRESET_TRANSACTIONS.find((tx) => tx.id === selectedTxId) || PRESET_TRANSACTIONS[0];
  }, [selectedTxId]);

  const [customTx, setCustomTx] = useState<Transaction>({ ...activePreset });

  // Whenever preset selection changes, update customTx
  const handleSelectPreset = (tx: Transaction) => {
    setSelectedTxId(tx.id);
    setCustomTx({ ...tx, features: { ...tx.features } });
  };

  const handleFeatureChange = (feature: string, val: number) => {
    setCustomTx((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: val,
      },
    }));
  };

  const handleAmountChange = (amount: number) => {
    setCustomTx((prev) => ({
      ...prev,
      amount: Math.max(0.01, amount),
    }));
  };

  const handleHourChange = (hour: number) => {
    setCustomTx((prev) => ({
      ...prev,
      timeSeconds: hour * 3600,
    }));
  };

  // Run scoring across all 3 models
  const modelScores = useMemo(() => {
    return scoreAllModels(customTx, threshold);
  }, [customTx, threshold]);

  // Compute SHAP values for the transaction
  const shapResult = useMemo(() => {
    return computeShapAttribution(customTx);
  }, [customTx]);

  const isFlagged = modelScores.xgb.fraudProbability >= threshold;

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Inference &amp; TreeSHAP Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Real-Time Transaction Risk &amp; Explainability
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Simulate individual credit card charges, inspect live predictions across <strong className="text-slate-200">XGBoost</strong>, <strong className="text-slate-200">Random Forest</strong>, and <strong className="text-slate-200">Logistic Regression</strong>, and examine local <strong className="text-indigo-300">SHAP feature attributions</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 self-start lg:self-auto">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Decision Threshold (T)</div>
              <div className="text-lg font-bold text-indigo-400">{(threshold * 100).toFixed(0)}%</div>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-indigo-500 cursor-pointer"
            />
            <button
              onClick={() => setThreshold(0.22)}
              title="Reset to Cost-Optimal Threshold (0.22)"
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Reset 0.22
            </button>
          </div>
        </div>
      </div>

      {/* Preset Transaction Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select a Curated Test Transaction (from ULB Test Split)
          </span>
          <span className="text-xs text-slate-500">8 Real-World Test Profiles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_TRANSACTIONS.map((tx) => {
            const isSelected = selectedTxId === tx.id;
            const isFraudLabel = tx.label === 'Fraud';
            return (
              <button
                key={tx.id}
                onClick={() => handleSelectPreset(tx)}
                className={`text-left p-3 rounded-xl border transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isFraudLabel
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Actual: {tx.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    ${tx.amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-300 line-clamp-1">{tx.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {tx.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Controls + Model Probabilities + SHAP Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Transaction Parameters
              </h3>
              <button
                onClick={() => handleSelectPreset(activePreset)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Amount Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Amount (USD / EUR)
                </span>
                <span className="font-mono font-bold text-white">${customTx.amount.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3000"
                step="1"
                value={customTx.amount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$0.50 (micro)</span>
                <span>$1,000</span>
                <span>$3,000+</span>
              </div>
            </div>

            {/* Time of Day */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Time of Day (24h)
                </span>
                <span className="font-mono font-bold text-white">
                  {Math.floor((customTx.timeSeconds / 3600) % 24)}:00 hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={Math.floor((customTx.timeSeconds / 3600) % 24)}
                onChange={(e) => handleHourChange(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>00:00 (Night)</span>
                <span>12:00 (Noon)</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Key PCA Discriminators */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Key PCA Components</span>
                <span className="text-[10px] text-slate-500">Standard Deviations (σ)</span>
              </div>

              {/* V14 Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    V14 <span className="text-[10px] text-rose-400">(Top Fraud Driver)</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      (customTx.features.V14 ?? 0) < -2.0 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {(customTx.features.V14 ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="4"
                  step="0.1"
                  value={customTx.features.V14 ?? 0}
                  onChange={(e) => handleFeatureChange('V14', parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500">Normal range: -1.0 to +1.0. Extreme &lt; -3.0 indicates fraud.</div>
              </div>

              {/* V4 Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    V4 <span className="text-[10px] text-amber-400">(Velocity / Risk)</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      (customTx.features.V4 ?? 0) > 1.5 ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {(customTx.features.V4 ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="12"
                  step="0.1"
                  value={customTx.features.V4 ?? 0}
                  onChange={(e) => handleFeatureChange('V4', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* V12 Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">V12 (Merchant Vector)</span>
                  <span className="font-mono text-xs text-slate-300">
                    {(customTx.features.V12 ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="4"
                  step="0.1"
                  value={customTx.features.V12 ?? 0}
                  onChange={(e) => handleFeatureChange('V12', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* V10 Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">V10 (Cardholder Profile)</span>
                  <span className="font-mono text-xs text-slate-300">
                    {(customTx.features.V10 ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="4"
                  step="0.1"
                  value={customTx.features.V10 ?? 0}
                  onChange={(e) => handleFeatureChange('V10', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* V17 Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">V17 (Burst Attack Vector)</span>
                  <span className="font-mono text-xs text-slate-300">
                    {(customTx.features.V17 ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="4"
                  step="0.1"
                  value={customTx.features.V17 ?? 0}
                  onChange={(e) => handleFeatureChange('V17', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model Benchmarking & SHAP Explanations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Real-time Model Verdict Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* XGBoost (Champion) */}
            <div
              className={`p-4 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
                modelScores.xgb.fraudProbability >= threshold
                  ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">XGBoost (Champion)</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PR-AUC: 0.884
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-white">
                  {(modelScores.xgb.fraudProbability * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    modelScores.xgb.fraudProbability >= threshold
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {modelScores.xgb.fraudProbability >= threshold ? 'FLAG FRAUD' : 'APPROVE'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    modelScores.xgb.fraudProbability >= threshold
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, modelScores.xgb.fraudProbability * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Latency: {modelScores.xgb.inferenceTimeMs}ms</span>
                <span>Threshold: {(threshold * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Random Forest */}
            <div
              className={`p-4 rounded-2xl border transition-all bg-slate-900 ${
                modelScores.rf.fraudProbability >= threshold
                  ? 'border-rose-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Random Forest</span>
                <span className="text-[10px] text-slate-400">100 Trees</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-white">
                  {(modelScores.rf.fraudProbability * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    modelScores.rf.fraudProbability >= threshold
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {modelScores.rf.fraudProbability >= threshold ? 'FLAG' : 'APPROVE'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, modelScores.rf.fraudProbability * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Latency: {modelScores.rf.inferenceTimeMs}ms</span>
                <span>PR-AUC: 0.849</span>
              </div>
            </div>

            {/* Logistic Regression */}
            <div
              className={`p-4 rounded-2xl border transition-all bg-slate-900 ${
                modelScores.lr.fraudProbability >= threshold
                  ? 'border-rose-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Logistic Regression</span>
                <span className="text-[10px] text-slate-400">Balanced Weights</span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-white">
                  {(modelScores.lr.fraudProbability * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    modelScores.lr.fraudProbability >= threshold
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {modelScores.lr.fraudProbability >= threshold ? 'FLAG' : 'APPROVE'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, modelScores.lr.fraudProbability * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Latency: {modelScores.lr.inferenceTimeMs}ms</span>
                <span>PR-AUC: 0.728</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isFlagged
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {isFlagged ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider">
                {isFlagged ? 'Automated Risk Interception Triggered' : 'Transaction Cleared (Low Risk)'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{shapResult.summaryText}</p>
            </div>
          </div>

          {/* SHAP Waterfall Attribution Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  SHAP Waterfall Feature Attribution (E[f(X)] → f(X))
                </h3>
                <p className="text-xs text-slate-400">
                  Explaining XGBoost prediction using additive Shapley values. Positive (+) pushes towards fraud; negative (-) supports legitimacy.
                </p>
              </div>

              {/* Base vs Output Log-Odds */}
              <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500">Base E[f(x)]:</span>{' '}
                  <span className="text-slate-300 font-bold">{shapResult.baseValue}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <div>
                  <span className="text-slate-500">Output f(x):</span>{' '}
                  <span
                    className={`font-bold ${
                      shapResult.outputLogOdds > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {shapResult.outputLogOdds > 0 ? '+' : ''}
                    {shapResult.outputLogOdds}
                  </span>
                </div>
              </div>
            </div>

            {/* Waterfall Feature Bars */}
            <div className="space-y-2.5">
              {shapResult.contributions.slice(0, 7).map((item, idx) => {
                const isFraudDirection = item.direction === 'fraud';
                return (
                  <div
                    key={item.feature}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{item.feature}</span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          val = {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.contributionPct}% impact
                        </span>
                        <span
                          className={`font-mono font-bold text-xs flex items-center gap-1 px-2 py-0.5 rounded ${
                            isFraudDirection
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isFraudDirection ? (
                            <TrendingUp className="w-3 h-3 text-rose-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                          )}
                          {item.shapValue > 0 ? '+' : ''}
                          {item.shapValue.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Bar representation */}
                    <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden flex">
                      {isFraudDirection ? (
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(8, item.contributionPct * 1.5))}%` }}
                        />
                      ) : (
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ml-auto"
                          style={{ width: `${Math.min(100, Math.max(8, item.contributionPct * 1.5))}%` }}
                        />
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.insight}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explainer Note */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Why Explainable AI matters in Fraud Operations:</span>
              <p>
                In compliance and merchant operations, black-box declines destroy legitimate cardholder trust and trigger regulatory penalties. SHAP attributes exact log-odds credit to each PCA dimension, allowing automated fraud ops to generate automated reason codes (e.g. <em>Reason 14: Unusual Credential Deviation</em>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
