import React, { useState } from 'react';
import { BENCHMARK_MODELS, PR_CURVE_DATA, ROC_CURVE_DATA } from '../data/benchmarkResults';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const ModelBenchmarks: React.FC = () => {
  const [selectedCurve, setSelectedCurve] = useState<'pr' | 'roc'>('pr');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Activity className="w-3.5 h-3.5" />
            Rigorous Empirical Benchmark (56,961 Test Transactions)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Imbalanced Model Benchmark &amp; Metric Deep Dive
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            With only 0.172% fraud, traditional accuracy (99.8%) is meaningless: a dummy classifier predicting 100% genuine achieves 99.8% accuracy while missing every single crime. Here is the true quantitative breakdown using PR-AUC, Recall, Precision, and Sub-millisecond latency.
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {BENCHMARK_MODELS.map((model) => (
          <div
            key={model.name}
            className={`rounded-2xl p-5 border relative overflow-hidden transition-all flex flex-col justify-between ${
              model.isChampion
                ? 'bg-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/30'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            {model.isChampion && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Champion
              </div>
            )}

            <div>
              <div className="mb-2">
                <h3 className="text-base font-bold text-white">{model.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">{model.tag}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {model.description}
              </p>

              {/* Primary Metric: PR-AUC */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">PR-AUC (Primary Metric)</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Gold Standard</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {model.prAuc.toFixed(3)}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${
                      model.isChampion ? 'bg-indigo-500' : 'bg-slate-500'
                    }`}
                    style={{ width: `${model.prAuc * 100}%` }}
                  />
                </div>
              </div>

              {/* Metric Breakdown Table */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">Fraud Recall</div>
                  <div className="font-bold text-slate-200 text-sm">
                    {(model.recall * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">{model.truePositiveCount}/98 caught</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">Precision</div>
                  <div className="font-bold text-slate-200 text-sm">
                    {(model.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">True fraud purity</div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">False Positives</div>
                  <div
                    className={`font-bold text-sm ${
                      model.falsePositiveCount > 100 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {model.falsePositiveCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {model.falsePositiveCount > 100 ? 'Severe friction!' : 'Low customer friction'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px]">Inference Latency</div>
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {model.inferenceLatencyMs} ms
                  </div>
                  <div className="text-[10px] text-slate-500">Sub-10ms target</div>
                </div>
              </div>
            </div>

            {/* Imbalance Handling Rationale */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Imbalance Strategy:</span>{' '}
              {model.imbalanceHandling}
            </div>
          </div>
        ))}
      </div>

      {/* Deep-Dive Insight: Why PR-AUC over ROC-AUC */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Critical ML Concept: Why PR-AUC is Far Superior to ROC-AUC for Imbalanced Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300">The Flaw of ROC-AUC in Fraud:</span>
            <p className="text-slate-400">
              The ROC curve plots True Positive Rate vs False Positive Rate (FPR = FP / (FP + TN)). Because there are <strong>56,863 True Negatives</strong>, even if a model produces 1,440 false alarms (as Logistic Regression does), the FPR is only 1,440 / (1,440 + 55,423) = 2.5%. The ROC-AUC remains deceptively high at <strong>0.974</strong>, masking an operational disaster of 1,440 blocked honest customers!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-300">Why Precision-Recall (PR-AUC) Exposes the Truth:</span>
            <p className="text-slate-400">
              Precision-Recall ignores True Negatives entirely. It focuses exclusively on the positive minority class: Precision = TP / (TP + FP). When Logistic Regression generates 1,440 false positives, its precision drops to <strong>5.8%</strong>, causing its PR-AUC to drop to <strong>0.728</strong>. XGBoost dominates with <strong>0.884 PR-AUC</strong> because it produces only 8 false positives.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visual Curves: PR-AUC vs ROC-AUC */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {selectedCurve === 'pr'
                ? 'Precision-Recall Curve (PR-AUC) Comparison'
                : 'Receiver Operating Characteristic (ROC-AUC) Comparison'}
            </h4>
            <p className="text-xs text-slate-400">
              {selectedCurve === 'pr'
                ? 'Notice how XGBoost maintains >90% precision all the way up to 85% recall.'
                : 'Notice how ROC curves look deceptively close to 1.0 due to 56k True Negatives.'}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedCurve('pr')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCurve === 'pr'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precision-Recall Curve (PR)
            </button>
            <button
              onClick={() => setSelectedCurve('roc')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCurve === 'roc'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ROC Curve
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-indigo-500" />
            <span className="font-semibold text-white">XGBoost (PR-AUC: 0.884, ROC: 0.982)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-purple-400" />
            <span className="text-slate-300">Random Forest (PR-AUC: 0.849, ROC: 0.965)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-blue-400" />
            <span className="text-slate-300">Logistic Regression (PR-AUC: 0.728, ROC: 0.974)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-slate-600 border-dashed" />
            <span className="text-slate-500">
              {selectedCurve === 'pr' ? 'No-Skill Baseline (0.0017)' : 'Random Guess (0.50)'}
            </span>
          </div>
        </div>

        {/* SVG Curve Rendering */}
        <div className="relative h-64 w-full pt-2">
          <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
            {/* Grid */}
            <line x1="50" y1="20" x2="570" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
            <line x1="50" y1="65" x2="570" y2="65" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
            <line x1="50" y1="110" x2="570" y2="110" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
            <line x1="50" y1="155" x2="570" y2="155" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
            <line x1="50" y1="200" x2="570" y2="200" stroke="#475569" opacity="0.8" />
            <line x1="50" y1="20" x2="50" y2="200" stroke="#475569" opacity="0.8" />

            {/* Y labels */}
            <text x="45" y="24" textAnchor="end" fill="#94a3b8" fontSize="10">1.0</text>
            <text x="45" y="69" textAnchor="end" fill="#94a3b8" fontSize="10">0.75</text>
            <text x="45" y="114" textAnchor="end" fill="#94a3b8" fontSize="10">0.50</text>
            <text x="45" y="159" textAnchor="end" fill="#94a3b8" fontSize="10">0.25</text>
            <text x="45" y="204" textAnchor="end" fill="#94a3b8" fontSize="10">0.0</text>

            {/* X labels */}
            <text x="50" y="215" textAnchor="middle" fill="#94a3b8" fontSize="10">0.0</text>
            <text x="180" y="215" textAnchor="middle" fill="#94a3b8" fontSize="10">0.25</text>
            <text x="310" y="215" textAnchor="middle" fill="#94a3b8" fontSize="10">0.50</text>
            <text x="440" y="215" textAnchor="middle" fill="#94a3b8" fontSize="10">0.75</text>
            <text x="570" y="215" textAnchor="middle" fill="#94a3b8" fontSize="10">1.0</text>

            {/* Axes Names */}
            <text x="310" y="235" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">
              {selectedCurve === 'pr' ? 'Recall (Fraction of Total Fraud Caught)' : 'False Positive Rate (FPR)'}
            </text>
            <text
              x="-110"
              y="18"
              transform="rotate(-90)"
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="bold"
            >
              {selectedCurve === 'pr' ? 'Precision' : 'True Positive Rate (Recall)'}
            </text>

            {selectedCurve === 'pr' ? (
              <>
                {/* Baseline: horizontal line at 0.0017 */}
                <line x1="50" y1="199" x2="570" y2="199" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Logistic Regression Path */}
                {(() => {
                  const pts = PR_CURVE_DATA.map((d) => {
                    const x = 50 + d.recall * 520;
                    const y = 200 - d.lr * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={pts} opacity="0.8" />;
                })()}

                {/* Random Forest Path */}
                {(() => {
                  const pts = PR_CURVE_DATA.map((d) => {
                    const x = 50 + d.recall * 520;
                    const y = 200 - d.rf * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#c084fc" strokeWidth="2.5" points={pts} opacity="0.8" />;
                })()}

                {/* XGBoost Path */}
                {(() => {
                  const pts = PR_CURVE_DATA.map((d) => {
                    const x = 50 + d.recall * 520;
                    const y = 200 - d.xgb * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#6366f1" strokeWidth="3.5" points={pts} />;
                })()}
              </>
            ) : (
              <>
                {/* Diagonal line for random ROC */}
                <line x1="50" y1="200" x2="570" y2="20" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Logistic Regression ROC */}
                {(() => {
                  const pts = ROC_CURVE_DATA.map((d) => {
                    const x = 50 + d.fpr * 520;
                    const y = 200 - d.lr * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={pts} opacity="0.8" />;
                })()}

                {/* Random Forest ROC */}
                {(() => {
                  const pts = ROC_CURVE_DATA.map((d) => {
                    const x = 50 + d.fpr * 520;
                    const y = 200 - d.rf * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#c084fc" strokeWidth="2.5" points={pts} opacity="0.8" />;
                })()}

                {/* XGBoost ROC */}
                {(() => {
                  const pts = ROC_CURVE_DATA.map((d) => {
                    const x = 50 + d.fpr * 520;
                    const y = 200 - d.xgb * 180;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline fill="none" stroke="#6366f1" strokeWidth="3.5" points={pts} />;
                })()}
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
