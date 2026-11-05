import React, { useState, useMemo } from 'react';
import { CostParams } from '../types/fraud';
import { getCostMetricsAtThreshold } from '../utils/mlEngine';
import { XGB_THRESHOLD_CURVE } from '../data/benchmarkResults';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertOctagon,
  Percent,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const ThresholdOptimizer: React.FC = () => {
  // Cost configuration state
  const [costParams, setCostParams] = useState<CostParams>({
    costFalseNegative: 250, // $250 average chargeback loss + stolen amount
    costFalsePositive: 15,  // $15 cardholder friction, SMS OTP verification, churn risk
    costTruePositive: 3,    // $3 automated block / processing fee
    costTrueNegative: 0,
    totalTestTransactions: 56961,
    totalTestFraud: 98,
    totalTestGenuine: 56863,
  });

  // Active threshold slider
  const [currentThreshold, setCurrentThreshold] = useState<number>(0.22);

  // Default threshold 0.50 metrics
  const defaultMetrics = useMemo(() => {
    return getCostMetricsAtThreshold(0.50, costParams);
  }, [costParams]);

  // Current threshold metrics
  const currentMetrics = useMemo(() => {
    return getCostMetricsAtThreshold(currentThreshold, costParams);
  }, [currentThreshold, costParams]);

  // Calculate the cost curve across 0.02 to 0.90 to find the minimum cost point
  const costCurveData = useMemo(() => {
    return XGB_THRESHOLD_CURVE.map((pt) => {
      const res = getCostMetricsAtThreshold(pt.threshold, costParams);
      return {
        threshold: pt.threshold,
        totalCost: res.totalCost,
        fnCost: res.costBreakdown.fnCost,
        fpCost: res.costBreakdown.fpCost,
        tpCost: res.costBreakdown.tpCost,
        recall: pt.recall,
        precision: pt.precision,
      };
    });
  }, [costParams]);

  // Find optimal minimum cost threshold
  const optimalPoint = useMemo(() => {
    return costCurveData.reduce((prev, curr) => (curr.totalCost < prev.totalCost ? curr : prev));
  }, [costCurveData]);

  const savings = defaultMetrics.totalCost - currentMetrics.totalCost;
  const isOptimal = Math.abs(currentThreshold - optimalPoint.threshold) < 0.03;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Cost-Sensitive Decision Theory
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Threshold Optimization &amp; Financial Tradeoffs
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Default 0.50 thresholds treat false positives and false negatives symmetrically. In fraud detection, missing a fraudster costs orders of magnitude more than an automated cardholder verification SMS. Tune the threshold to minimize overall dollar losses.
            </p>
          </div>

          {/* Quick Optimal Jump Button */}
          <button
            onClick={() => setCurrentThreshold(optimalPoint.threshold)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all self-start lg:self-auto"
          >
            <span>Snap to Optimal T* ({optimalPoint.threshold.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Grid: Financial Matrix Inputs + Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Cost Matrix Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Operational Cost Matrix
            </h3>

            {/* False Negative Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-rose-300 font-medium">Cost of False Negative ($C_FN)</span>
                <span className="font-mono font-bold text-white">${costParams.costFalseNegative}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={costParams.costFalseNegative}
                onChange={(e) =>
                  setCostParams((prev) => ({ ...prev, costFalseNegative: parseInt(e.target.value) }))
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Direct fraud loss + chargeback penalty ($15-$40) + card re-issuance fee.
              </div>
            </div>

            {/* False Positive Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-amber-300 font-medium">Cost of False Positive ($C_FP)</span>
                <span className="font-mono font-bold text-white">${costParams.costFalsePositive}</span>
              </div>
              <input
                type="range"
                min="2"
                max="60"
                step="2"
                value={costParams.costFalsePositive}
                onChange={(e) =>
                  setCostParams((prev) => ({ ...prev, costFalsePositive: parseInt(e.target.value) }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Customer friction, SMS 2FA dispatch, support inquiry, customer churn probability.
              </div>
            </div>

            {/* True Positive Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Cost of True Positive ($C_TP)</span>
                <span className="font-mono font-bold text-white">${costParams.costTruePositive}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={costParams.costTruePositive}
                onChange={(e) =>
                  setCostParams((prev) => ({ ...prev, costTruePositive: parseInt(e.target.value) }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Automated authorization block processing or card lock workflow.
              </div>
            </div>

            {/* Mathematical Equation */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold">Cost Objective Function:</div>
              <div className="text-indigo-300">
                Cost(T) = FN(T)·$C_FN + FP(T)·$C_FP + TP(T)·$C_TP
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Evaluated on 56,961 untouched test transactions (98 fraud, 56,863 genuine).
              </div>
            </div>
          </div>

          {/* Active Threshold Slider Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Active Threshold (T)
              </span>
              <span className="text-sm font-mono font-bold text-indigo-400">
                {currentThreshold.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0.02"
              max="0.90"
              step="0.01"
              value={currentThreshold}
              onChange={(e) => setCurrentThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-400">
              <span
                onClick={() => setCurrentThreshold(0.05)}
                className="cursor-pointer hover:text-white"
              >
                0.05 (High Recall)
              </span>
              <span
                onClick={() => setCurrentThreshold(optimalPoint.threshold)}
                className="cursor-pointer text-emerald-400 font-semibold hover:underline"
              >
                {optimalPoint.threshold.toFixed(2)} (Optimal)
              </span>
              <span
                onClick={() => setCurrentThreshold(0.50)}
                className="cursor-pointer hover:text-white"
              >
                0.50 (Default)
              </span>
              <span
                onClick={() => setCurrentThreshold(0.80)}
                className="cursor-pointer hover:text-white"
              >
                0.80 (High Prec)
              </span>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Side-by-Side Impact & Interactive SVG Cost Curve */}
        <div className="lg:col-span-8 space-y-6">
          {/* Comparison Cards: Default 0.50 vs Current Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Threshold (0.50) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Standard Default Benchmark</div>
                  <div className="text-sm font-bold text-white">Threshold T = 0.50</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Standard 50/50
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Fraud Recall (Caught)</div>
                  <div className="text-lg font-bold text-white">
                    {(defaultMetrics.point.recall * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {defaultMetrics.point.tp} of 98 fraud caught
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Missed Frauds (FN)</div>
                  <div className="text-lg font-bold text-rose-400">
                    {defaultMetrics.point.fn} missed
                  </div>
                  <div className="text-[10px] text-rose-400/80">
                    ${defaultMetrics.costBreakdown.fnCost.toLocaleString()} fraud losses
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">False Positives (FP)</div>
                  <div className="text-lg font-bold text-slate-200">
                    {defaultMetrics.point.fp} alarms
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ${defaultMetrics.costBreakdown.fpCost.toLocaleString()} review cost
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Precision</div>
                  <div className="text-lg font-bold text-white">
                    {(defaultMetrics.point.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">F1: {defaultMetrics.point.f1}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Operational Cost:</span>
                <span className="font-mono font-bold text-base text-slate-200">
                  ${defaultMetrics.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Current / Tuned Threshold */}
            <div
              className={`border rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden ${
                isOptimal
                  ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900 border-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <div className="text-xs text-indigo-300 font-medium">Cost-Tuned Threshold</div>
                  <div className="text-sm font-bold text-white">
                    Threshold T = {currentThreshold.toFixed(2)}
                  </div>
                </div>
                {isOptimal ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cost Optimal
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    Custom Tuning
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Fraud Recall (Caught)</div>
                  <div className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                    {(currentMetrics.point.recall * 100).toFixed(1)}%
                    {currentMetrics.point.recall > defaultMetrics.point.recall && (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-300">
                    {currentMetrics.point.tp} of 98 (+
                    {currentMetrics.point.tp - defaultMetrics.point.tp} extra caught!)
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Missed Frauds (FN)</div>
                  <div className="text-lg font-bold text-white">
                    {currentMetrics.point.fn} missed
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ${currentMetrics.costBreakdown.fnCost.toLocaleString()} fraud losses
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">False Positives (FP)</div>
                  <div className="text-lg font-bold text-slate-200">
                    {currentMetrics.point.fp} alarms
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ${currentMetrics.costBreakdown.fpCost.toLocaleString()} review cost
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Precision</div>
                  <div className="text-lg font-bold text-white">
                    {(currentMetrics.point.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">F1: {currentMetrics.point.f1}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Operational Cost:</span>
                <div className="text-right">
                  <div className="font-mono font-bold text-base text-emerald-400">
                    ${currentMetrics.totalCost.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold">
                    {savings >= 0 ? `Save $${savings.toLocaleString()} vs 0.50` : `+$${Math.abs(savings).toLocaleString()} higher`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cost Curve (SVG Chart) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  Total Financial Cost vs. Decision Threshold Curve
                </h4>
                <p className="text-xs text-slate-400">
                  Shows how too high a threshold incurs heavy False Negative costs, while too low incurs excessive friction.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Optimal T* ({optimalPoint.threshold.toFixed(2)})
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  Default (0.50)
                </span>
              </div>
            </div>

            {/* SVG Curve */}
            <div className="relative h-56 w-full pt-2">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="#475569" opacity="0.8" />
                <line x1="40" y1="20" x2="40" y2="170" stroke="#475569" opacity="0.8" />

                {/* Y-axis labels */}
                <text x="35" y="25" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  $12k
                </text>
                <text x="35" y="75" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  $8k
                </text>
                <text x="35" y="125" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  $4k
                </text>
                <text x="35" y="175" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  $0
                </text>

                {/* X-axis labels */}
                <text x="40" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
                  0.0
                </text>
                <text x="175" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
                  0.25
                </text>
                <text x="310" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
                  0.50 (Default)
                </text>
                <text x="445" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
                  0.75
                </text>
                <text x="580" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
                  1.00
                </text>

                {/* Plot Path */}
                {(() => {
                  const maxCost = 14000;
                  const minCost = 0;
                  const points = costCurveData.map((d) => {
                    const x = 40 + (d.threshold / 1.0) * 540;
                    const y = 170 - ((d.totalCost - minCost) / (maxCost - minCost)) * 150;
                    return `${x},${y}`;
                  });
                  return (
                    <>
                      {/* Gradient Area under curve */}
                      <defs>
                        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`40,170 ${points.join(' ')} 580,170`}
                        fill="url(#costGrad)"
                      />
                      <polyline
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="3"
                        points={points.join(' ')}
                      />
                    </>
                  );
                })()}

                {/* Optimal point indicator */}
                {(() => {
                  const x = 40 + (optimalPoint.threshold / 1.0) * 540;
                  const y = 170 - (optimalPoint.totalCost / 14000) * 150;
                  return (
                    <g>
                      <line x1={x} y1="20" x2={x} y2="170" stroke="#10b981" strokeDasharray="3 3" />
                      <circle cx={x} cy={y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 12} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                        Min Cost (${optimalPoint.totalCost.toLocaleString()})
                      </text>
                    </g>
                  );
                })()}

                {/* Default 0.50 point indicator */}
                {(() => {
                  const x = 40 + 0.50 * 540;
                  const y = 170 - (defaultMetrics.totalCost / 14000) * 150;
                  return (
                    <g>
                      <line x1={x} y1="20" x2={x} y2="170" stroke="#94a3b8" strokeDasharray="3 3" />
                      <circle cx={x} cy={y} r="5" fill="#64748b" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 10} textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        0.50 ($3,870)
                      </text>
                    </g>
                  );
                })()}

                {/* Active Slider Indicator */}
                {(() => {
                  const x = 40 + (currentThreshold / 1.0) * 540;
                  const y = 170 - (currentMetrics.totalCost / 14000) * 150;
                  return (
                    <g>
                      <circle cx={x} cy={y} r="8" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={x} y="15" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="bold">
                        T = {currentThreshold.toFixed(2)}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Dynamic 2x2 Confusion Matrix Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Confusion Matrix at T = {currentThreshold.toFixed(2)}</span>
              <span className="text-xs font-normal text-slate-400">Total: 56,961 Transactions</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* True Negatives */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  True Negatives (TN)
                </div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {currentMetrics.point.tn.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Genuine transactions correctly approved ($0 cost)
                </div>
              </div>

              {/* False Positives */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  False Positives (FP)
                </div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {currentMetrics.point.fp.toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-300 mt-0.5">
                  Genuine flagged for review (${currentMetrics.costBreakdown.fpCost.toLocaleString()})
                </div>
              </div>

              {/* False Negatives */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  False Negatives (FN) — Missed Fraud
                </div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {currentMetrics.point.fn.toLocaleString()}
                </div>
                <div className="text-[11px] text-rose-300 mt-0.5">
                  Stolen fraud approved (${currentMetrics.costBreakdown.fnCost.toLocaleString()} financial loss)
                </div>
              </div>

              {/* True Positives */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  True Positives (TP) — Caught Fraud
                </div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {currentMetrics.point.tp.toLocaleString()} of 98
                </div>
                <div className="text-[11px] text-indigo-300 mt-0.5">
                  Fraud prevented (${(currentMetrics.point.tp * costParams.costFalseNegative).toLocaleString()} saved)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
