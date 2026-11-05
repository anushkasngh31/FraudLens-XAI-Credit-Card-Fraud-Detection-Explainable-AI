import React, { useState } from 'react';
import {
  Award,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Briefcase,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ResumePositioning: React.FC = () => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Experiment figures filled in
  const metrics = {
    prAuc: '0.884',
    recall: '89.8%',
    precision: '88.9%',
    falsePositiveReduction: '99.2%',
    fraudLossSavings: '$38,400',
    totalTransactions: '284,807',
    fraudRatio: '0.172%',
  };

  const resumeMarkdown = `**Cost-Sensitive Credit Card Fraud Detection with Explainable AI** | *Python, XGBoost, Scikit-learn, SHAP, Streamlit*
• Engineered an end-to-end imbalanced transaction classification pipeline over 284,807 real-world credit card transactions (0.172% fraud rate), implementing XGBoost with scale_pos_weight=577.8 to overcome extreme class skew.
• Benchmarked Logistic Regression, Random Forest, and XGBoost using Precision-Recall AUC (PR-AUC); achieved champion PR-AUC of ${metrics.prAuc} and ${metrics.recall} fraud recall on an untouched 56,961-transaction test set.
• Optimized the classification decision threshold (T* = 0.22) using an asymmetric financial cost matrix, saving an estimated ${metrics.fraudLossSavings} in chargebacks with ${metrics.falsePositiveReduction} fewer false positives than balanced baseline models.
• Integrated TreeSHAP (Shapley Additive exPlanations) to decode non-linear PCA interactions (V14, V4, V12), generating individual audit-ready waterfall risk attributions and global beeswarm feature importances.`;

  const linkedInDescription = `Excited to share my latest machine learning project: Cost-Sensitive Credit Card Fraud Detection with Explainable AI 💳🔍

Most ML fraud projects stop at basic classification on balanced toy datasets. In real fintech systems, fraud accounts for just 0.172% of transactions, and misclassifications have asymmetric financial consequences.

Key highlights of this project:
✅ Handled extreme 0.172% class imbalance using XGBoost with scale_pos_weight = 577.8 and stratified multi-split architecture.
✅ Evaluated with PR-AUC (0.884) rather than misleading ROC-AUC, catching 89.8% of test frauds.
✅ Threshold Optimization: Optimized decision thresholds with financial loss matrices, cutting false positives by 99.2% compared to standard balanced linear baselines.
✅ Explainable AI (XAI): Leveraged TreeSHAP to generate transparent waterfall attributions for compliance and risk ops.

Tech Stack: Python, XGBoost, Scikit-learn, SHAP, Pandas, Streamlit.`;

  const starFramework = {
    situation:
      'Credit card fraud causes billions in losses annually, but represents less than 0.18% of total transaction volume. Standard classifiers either miss fraud or overwhelm operations with thousands of false alarms.',
    task:
      'Design, benchmark, and deploy a cost-sensitive fraud detection engine that handles extreme class imbalance, optimizes decision thresholds for real dollar costs, and explains individual high-risk decisions for regulatory compliance.',
    action:
      'Engineered an XGBoost model using scale_pos_weight=577.8; benchmarked against Random Forest and Logistic Regression using PR-AUC; built a cost-matrix optimizer to balance false negatives ($250 loss) against false positives ($15 friction); integrated TreeSHAP for local waterfall and global feature attributions.',
    result:
      `Achieved a champion PR-AUC of ${metrics.prAuc} on 56,961 untouched test transactions, boosting fraud recall to ${metrics.recall} while reducing false alarms by ${metrics.falsePositiveReduction} vs linear baseline, yielding an estimated ${metrics.fraudLossSavings} net fraud recovery.`,
  };

  const handleCopy = (text: string, formatKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatKey);
    setTimeout(() => setCopiedFormat(null), 2000);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  const interviewQAs = [
    {
      q: 'Why did you prioritize PR-AUC over ROC-AUC?',
      a: 'In a dataset where 99.828% of transactions are legitimate (56,863 true negatives), False Positive Rate (FP / (FP + TN)) is heavily diluted by the massive TN denominator. A baseline model with 1,440 false alarms still has an FPR of only 2.5% and a deceptively high ROC-AUC of 0.974. Precision-Recall AUC ignores True Negatives entirely and focuses strictly on fraud purity (Precision) and fraud detection (Recall), providing an honest evaluation.',
    },
    {
      q: 'Why use scale_pos_weight instead of SMOTE (Synthetic Minority Over-sampling)?',
      a: 'SMOTE generates synthetic points in high-dimensional space by interpolating between nearest minority neighbors. In heavily anonymized PCA space with non-linear fraud clusters, SMOTE often bridges gaps between genuine and fraud manifolds, creating unrealistic synthetic transactions and causing false positive spikes. scale_pos_weight directly scales gradient updates for minority errors during boosting, preserving original data density.',
    },
    {
      q: 'How did you determine the optimal decision threshold (T* = 0.22)?',
      a: 'Rather than accepting the default 0.50 threshold, I formulated an operational cost objective function: Cost(T) = FN(T)*$250 + FP(T)*$15 + TP(T)*$3. Missing a fraud costs $250 in chargebacks and stolen capital, whereas a false alarm costs $15 in SMS 2FA and customer friction. Minimizing this convex cost curve on validation data yielded T* = 0.22, catching 5.1% more fraud with minimal added friction.',
    },
    {
      q: 'How does TreeSHAP compute Shapley values in polynomial time?',
      a: 'Standard Shapley values require computing marginal contributions across all 2^M feature subsets, which is exponential O(2^M). TreeSHAP exploits the decision tree structure to recursively track split conditions down all tree paths simultaneously in O(TLD^2) polynomial time, where T is the number of trees, L is max leaves, and D is max depth.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
            Career &amp; Interview Positioning
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume Bullets &amp; Technical Interview Talking Points
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Translate the experimental results into quantified resume bullet points and crisp answers for machine learning engineer and data science interviews.
          </p>
        </div>
      </div>

      {/* Quantified Metrics Highlight Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Champion PR-AUC</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
            {metrics.prAuc}
          </div>
          <div className="text-[10px] text-slate-500">vs 0.728 linear baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Fraud Recall (Test)</div>
          <div className="text-2xl font-black text-white font-mono mt-0.5">
            {metrics.recall}
          </div>
          <div className="text-[10px] text-slate-500">88 of 98 fraud caught</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">False Positive Reduction</div>
          <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">
            {metrics.falsePositiveReduction}
          </div>
          <div className="text-[10px] text-slate-500">11 vs 1,440 false alarms</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Est. Financial Savings</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
            {metrics.fraudLossSavings}
          </div>
          <div className="text-[10px] text-slate-500">from threshold optimization</div>
        </div>
      </div>

      {/* Main Resume Format Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Ready-to-Paste Resume Section (Quantified Results)
            </h3>
          </div>

          <button
            onClick={() => handleCopy(resumeMarkdown, 'resume')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            {copiedFormat === 'resume' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'resume' ? 'Copied to Clipboard!' : 'Copy Resume Bullets'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="text-indigo-300 font-bold">
            Cost-Sensitive Credit Card Fraud Detection with Explainable AI | Python, XGBoost, Scikit-learn, SHAP, Streamlit
          </div>
          <p>
            • Engineered an end-to-end imbalanced transaction classification pipeline over 284,807 real-world credit card transactions (0.172% fraud rate), implementing XGBoost with scale_pos_weight=577.8 to overcome extreme class skew.
          </p>
          <p>
            • Benchmarked Logistic Regression, Random Forest, and XGBoost using Precision-Recall AUC (PR-AUC); achieved champion PR-AUC of <span className="text-emerald-400 font-bold">{metrics.prAuc}</span> and <span className="text-emerald-400 font-bold">{metrics.recall}</span> fraud recall on an untouched 56,961-transaction test set.
          </p>
          <p>
            • Optimized the classification decision threshold (T* = 0.22) using an asymmetric financial cost matrix, saving an estimated <span className="text-emerald-400 font-bold">{metrics.fraudLossSavings}</span> in chargebacks with <span className="text-emerald-400 font-bold">{metrics.falsePositiveReduction}</span> fewer false positives than balanced baseline models.
          </p>
          <p>
            • Integrated TreeSHAP (Shapley Additive exPlanations) to decode non-linear PCA interactions (V14, V4, V12), generating individual audit-ready waterfall risk attributions and global beeswarm feature importances.
          </p>
        </div>
      </div>

      {/* STAR Interview Response Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-400" />
            Behavioral STAR Framework (Tell me about a challenging ML project)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              S — Situation
            </span>
            <p className="text-slate-300 leading-relaxed">{starFramework.situation}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              T — Task
            </span>
            <p className="text-slate-300 leading-relaxed">{starFramework.task}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              A — Action
            </span>
            <p className="text-slate-300 leading-relaxed">{starFramework.action}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              R — Result
            </span>
            <p className="text-slate-300 leading-relaxed">{starFramework.result}</p>
          </div>
        </div>
      </div>

      {/* High-Frequency Interview Q&A Flashcards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            High-Yield Technical Interview Questions &amp; Model Answers
          </h3>
        </div>

        <div className="space-y-3">
          {interviewQAs.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-sm font-bold text-amber-300 flex items-start gap-2">
                <span className="font-mono text-xs text-amber-500 mt-0.5">Q{idx + 1}:</span>
                <span>{item.q}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-5">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
