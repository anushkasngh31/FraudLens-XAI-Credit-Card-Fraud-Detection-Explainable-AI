import React, { useState } from 'react';
import { GLOBAL_SHAP_FEATURES } from '../data/benchmarkResults';
import { PCA_EXPLANATION } from '../data/datasetInfo';
import {
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const ShapExplorer: React.FC = () => {
  const [selectedFeatureName, setSelectedFeatureName] = useState<string>('V14');

  const selectedFeature =
    GLOBAL_SHAP_FEATURES.find((f) => f.feature === selectedFeatureName) ||
    GLOBAL_SHAP_FEATURES[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Layers className="w-3.5 h-3.5" />
            Explainable AI (XAI) &amp; TreeSHAP
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Global Feature Importance &amp; Beeswarm Attributions
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            SHAP (SHapley Additive exPlanations) grounds predictions in cooperative game theory. Unlike arbitrary feature importance or Gini impurity, TreeSHAP satisfies efficiency, symmetry, dummy, and additivity axioms, providing unbiased local and global interpretability.
          </p>
        </div>
      </div>

      {/* Grid: Global SHAP Summary Plot & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Beeswarm Summary Plot */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                SHAP Summary Beeswarm Plot
              </h3>
              <p className="text-xs text-slate-400">
                Each dot represents a transaction. Horizontal position = SHAP value (impact on model). Color = feature value (Red: High, Blue: Low).
              </p>
            </div>

            {/* Color Gradient Legend */}
            <div className="hidden sm:flex flex-col items-end text-[10px] text-slate-400">
              <span>Feature Value</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-blue-400">Low</span>
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500" />
                <span className="text-rose-400">High</span>
              </div>
            </div>
          </div>

          {/* Beeswarm Rows */}
          <div className="space-y-3 pt-1">
            {GLOBAL_SHAP_FEATURES.map((feat) => {
              const isSelected = selectedFeatureName === feat.feature;
              return (
                <div
                  key={feat.feature}
                  onClick={() => setSelectedFeatureName(feat.feature)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{feat.feature}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Mean |SHAP| = {feat.meanAbsShap.toFixed(2)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        feat.correlationWithFraud === 'negative'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {feat.correlationWithFraud === 'negative'
                        ? 'Low value pushes Fraud'
                        : 'High value pushes Fraud'}
                    </span>
                  </div>

                  {/* Simulated Beeswarm Dot Dispersion */}
                  <div className="relative h-6 w-full bg-slate-900/90 rounded-lg overflow-hidden flex items-center px-4">
                    {/* Zero center axis line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/80 z-0" />

                    {/* Scatter dots */}
                    <div className="relative w-full h-full flex items-center justify-between z-10">
                      {feat.samplePoints.map((pt, i) => {
                        // Map shapValue (-2.0 to +4.0) to percentage (0% to 100%)
                        const leftPct = Math.max(5, Math.min(95, 50 + (pt.shapValue / 4.0) * 45));
                        // Color based on featureValueNorm
                        const isHigh = pt.featureValueNorm > 0.6;
                        const isMid = pt.featureValueNorm >= 0.4 && pt.featureValueNorm <= 0.6;

                        return (
                          <div
                            key={i}
                            className={`absolute w-3 h-3 rounded-full border border-slate-900 shadow-sm transition-transform hover:scale-150 ${
                              isHigh
                                ? 'bg-rose-500'
                                : isMid
                                ? 'bg-purple-500'
                                : 'bg-blue-500'
                            }`}
                            style={{
                              left: `${leftPct}%`,
                              top: `${20 + (i % 3) * 20}%`,
                            }}
                            title={`Feature val norm: ${pt.featureValueNorm.toFixed(2)}, SHAP: ${pt.shapValue}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-1 font-mono">
            <span>&larr; Negative SHAP (Pushes Legitimate)</span>
            <span className="text-slate-400 font-bold">SHAP = 0 (Neutral)</span>
            <span>Positive SHAP (Pushes Fraud) &rarr;</span>
          </div>
        </div>

        {/* Right 5 Cols: Selected Feature Deep Dive + PCA Transparency */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Feature Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Selected Feature Deep Dive
              </span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {selectedFeature.feature}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">{selectedFeature.description}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mean Absolute SHAP value is{' '}
                <strong className="text-white font-mono">{selectedFeature.meanAbsShap}</strong>. This
                makes {selectedFeature.feature} one of the top primary risk factors across the entire
                XGBoost tree ensemble.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Directional Behavior:</span>
                <span className="font-semibold text-slate-200">
                  {selectedFeature.correlationWithFraud === 'negative'
                    ? 'Inverted (Negative = Fraud)'
                    : 'Direct (Positive = Fraud)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tree Split Ranking:</span>
                <span className="font-semibold text-indigo-400 font-mono">Top Tier (Level 1-2 Splits)</span>
              </div>
            </div>
          </div>

          {/* PCA Anonymization Transparency Guide (Direct requirement from user brief) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Dataset Transparency: Anonymized PCA Notice
            </div>

            <h4 className="text-sm font-bold text-white">{PCA_EXPLANATION.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {PCA_EXPLANATION.whyAnonymized}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300">Untransformed Features:</div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {PCA_EXPLANATION.untransformedFeatures.map((item) => (
                  <div key={item.name} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="font-mono font-bold text-indigo-300">{item.name}:</span>{' '}
                    <span className="text-slate-400">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                How to communicate this on your resume:
              </span>
              <p className="text-[11px] text-slate-300">
                <em>
                  "Transparently documented that features V1-V28 are PCA-transformed to protect PII, demonstrating statistical reasoning and production-grade XAI rather than relying on assumed domain labels."
                </em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
