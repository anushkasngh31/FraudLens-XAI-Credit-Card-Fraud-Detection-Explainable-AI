import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DayPlan {
  day: number;
  title: string;
  subtitle: string;
  estimatedHours: string;
  goals: string[];
  tasks: {
    title: string;
    description: string;
    codeSnippet?: string;
    pitfallAvoided: string;
  }[];
}

const ROADMAP_DAYS: DayPlan[] = [
  {
    day: 1,
    title: 'Day 1 — Data Ingestion, EDA & Baseline Models',
    subtitle: 'Understanding the 0.172% imbalance, stratified splitting, and establishing baseline performance.',
    estimatedHours: '4 - 5 hours',
    goals: [
      'Download and explore the 284,807 transactions from Kaggle / ULB repository.',
      'Perform exploratory data analysis on class distribution, Time, and Amount distributions.',
      'Implement stratified train/val/test splits (70/10/20) to prevent data leakage.',
      'Train baseline Logistic Regression (with class_weight="balanced") and Random Forest.',
      'Record initial baseline metrics (PR-AUC, Recall, Precision).',
    ],
    tasks: [
      {
        title: 'Task 1.1: Dataset Download & Verification',
        description:
          'Acquire creditcard.csv (144MB uncompressed). Verify that exactly 492 fraud transactions (0.172%) exist across 284,807 total rows.',
        codeSnippet: `import pandas as pd
df = pd.read_csv('creditcard.csv')
print(f"Total: {len(df):,}, Fraud: {df['Class'].sum():,} ({df['Class'].mean()*100:.3f}%)")`,
        pitfallAvoided:
          'DO NOT drop missing values without checking; the ULB dataset is pre-cleaned with zero nulls.',
      },
      {
        title: 'Task 1.2: Robust Scaling for Time & Amount',
        description:
          'Amount has heavy skew (median $22 vs max $25,691). Scale Amount and Time using RobustScaler (median and IQR) instead of StandardScaler.',
        codeSnippet: `from sklearn.preprocessing import RobustScaler
rob = RobustScaler()
df['scaled_amount'] = rob.fit_transform(df[['Amount']])
df['scaled_time'] = rob.fit_transform(df[['Time']])`,
        pitfallAvoided:
          'Using StandardScaler on skewed amounts causes extreme outliers to dominate the mean.',
      },
      {
        title: 'Task 1.3: Stratified 3-Way Split (Train / Val / Test)',
        description:
          'Never use random split without stratification! A standard split might leave validation or test sets with too few fraud cases.',
        codeSnippet: `from sklearn.model_selection import train_test_split
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.125, random_state=42, stratify=y_train_val
)`,
        pitfallAvoided:
          'Never evaluate or tune thresholds on the test set! Reserve the 20% test set purely for untouched final evaluation.',
      },
      {
        title: 'Task 1.4: Train Baseline Models',
        description:
          'Fit LogisticRegression with class_weight="balanced" and RandomForestClassifier with class_weight="balanced_subsample".',
        codeSnippet: `from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
lr = LogisticRegression(class_weight='balanced', max_iter=1000).fit(X_train, y_train)
rf = RandomForestClassifier(n_estimators=100, class_weight='balanced_subsample', n_jobs=-1).fit(X_train, y_train)`,
        pitfallAvoided:
          'Standard Logistic Regression without class weights will predict 0 for every transaction and achieve false 99.8% accuracy.',
      },
    ],
  },
  {
    day: 2,
    title: 'Day 2 — XGBoost, Imbalance Optimization & TreeSHAP',
    subtitle: 'Champion model training, scale_pos_weight tuning, validation threshold optimization, and SHAP explainability.',
    estimatedHours: '5 - 6 hours',
    goals: [
      'Compute exact scale_pos_weight = (N_negative / N_positive) = 577.8.',
      'Train XGBClassifier with early stopping on validation PR-AUC.',
      'Tune max_depth (3 to 6) and learning_rate (0.05 to 0.1).',
      'Optimize the classification decision threshold T* on validation data using an operational cost matrix.',
      'Compute TreeSHAP values and generate local waterfall & global summary plots.',
    ],
    tasks: [
      {
        title: 'Task 2.1: XGBoost with scale_pos_weight',
        description:
          'Configure XGBoost to heavily penalize False Negatives directly inside the gradient descent loss function.',
        codeSnippet: `import xgboost as xgb
scale_pos = (y_train == 0).sum() / (y_train == 1).sum() # ~577.8
xgb_model = xgb.XGBClassifier(
    n_estimators=150, max_depth=5, learning_rate=0.1,
    scale_pos_weight=scale_pos, eval_metric='aucpr', random_state=42
)
xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)`,
        pitfallAvoided:
          'Do NOT use SMOTE blindly! Over-sampling synthetic points in high-dimensional PCA space distorts real fraud density. scale_pos_weight is strictly superior.',
      },
      {
        title: 'Task 2.2: Decision Threshold Optimization on Validation Set',
        description:
          'Iterate thresholds from 0.01 to 0.99 to minimize asymmetric dollar loss: Cost(T) = FN * $250 + FP * $15.',
        codeSnippet: `val_probs = xgb_model.predict_proba(X_val)[:, 1]
# Search threshold minimizing cost:
thresholds = np.linspace(0.01, 0.99, 100)
costs = [compute_cost(y_val, val_probs, t) for t in thresholds]
opt_threshold = thresholds[np.argmin(costs)] # Found ~0.22`,
        pitfallAvoided:
          'Never tune thresholds on the test set! That causes optimistic threshold overfitting.',
      },
      {
        title: 'Task 2.3: TreeSHAP Integration',
        description:
          'Initialize shap.TreeExplainer and compute exact Shapley attributions in polynomial time $O(TLD^2)$.',
        codeSnippet: `import shap
explainer = shap.TreeExplainer(xgb_model)
shap_values = explainer(X_test.head(500))
shap.summary_plot(shap_values, X_test.head(500)) # Beeswarm
shap.plots.waterfall(shap_values[0])             # Individual waterfall`,
        pitfallAvoided:
          'Do NOT use shap.KernelExplainer! KernelExplainer takes hours on tabular trees, whereas TreeExplainer runs in seconds.',
      },
    ],
  },
  {
    day: 3,
    title: 'Day 3 — Final Evaluation, Streamlit UI & Presentation',
    subtitle: 'Evaluating on untouched test set, error analysis, interactive dashboard, and GitHub README / resume.',
    estimatedHours: '4 - 5 hours',
    goals: [
      'Evaluate all 3 models on the untouched test set (56,961 transactions, 98 fraud).',
      'Generate final Precision-Recall (PR-AUC) and ROC curves side-by-side.',
      'Quantify the dollar savings of the optimized threshold vs default 0.50.',
      'Analyze False Negatives and False Positives (root-cause error inspection).',
      'Build Streamlit interactive dashboard.',
      'Draft a quantified GitHub README and resume bullets.',
    ],
    tasks: [
      {
        title: 'Task 3.1: Untouched Test Set Evaluation',
        description:
          'Apply the trained models and optimal threshold (0.22) to the test set. Record PR-AUC: 0.884, Recall: 89.8%, Precision: 88.9%.',
        codeSnippet: `test_probs = xgb_model.predict_proba(X_test)[:, 1]
test_pred = (test_probs >= opt_threshold).astype(int)
print(classification_report(y_test, test_pred))
print("Test PR-AUC:", average_precision_score(y_test, test_probs))`,
        pitfallAvoided:
          'Never report Accuracy alone. Always lead with PR-AUC, Recall, Precision, and Dollar Cost Savings.',
      },
      {
        title: 'Task 3.2: False Positive / Negative Root Cause Analysis',
        description:
          'Inspect the 10 missed fraud cases and 11 false positives. Identify edge cases (e.g., fraud with calm PCA vs legitimate transactions with unusual velocity).',
        codeSnippet: `fn_cases = X_test[(y_test == 1) & (test_pred == 0)]
print("Missed fraud features:\\n", fn_cases[['V14', 'V4', 'Amount']].describe())`,
        pitfallAvoided:
          'Treating model evaluation as a number instead of examining individual failure modes is what separates junior coders from senior ML engineers.',
      },
      {
        title: 'Task 3.3: Interactive Streamlit UI & README Documentation',
        description:
          'Build app_streamlit.py allowing recruiters/stakeholders to test transactions, adjust thresholds, and view SHAP waterfall plots.',
        codeSnippet: `streamlit run app_streamlit.py`,
        pitfallAvoided:
          'Ensure transparency in README that features V1-V28 are PCA transformed to protect cardholder privacy.',
      },
    ],
  },
];

export const ImplementationPlan: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    '1.1': true,
    '1.2': true,
    '1.3': true,
    '1.4': true,
  });

  const [expandedDay, setExpandedDay] = useState<number>(2);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const totalTasksCount = ROADMAP_DAYS.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = Math.round((completedCount / totalTasksCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Calendar className="w-3.5 h-3.5" />
              Structured 3-Day Implementation Roadmap
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              From Raw CSV to Production-Ready XAI Pipeline
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Follow this step-by-step roadmap to reproduce the experiments, train XGBoost with scale_pos_weight, optimize thresholds with cost matrices, and integrate TreeSHAP.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 min-w-[200px]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Roadmap Progress</span>
              <span className="text-indigo-400">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              {completedCount} of {totalTasksCount} tasks checked
            </div>
          </div>
        </div>
      </div>

      {/* 3 Days Accordion Cards */}
      <div className="space-y-4">
        {ROADMAP_DAYS.map((dayPlan) => {
          const isExpanded = expandedDay === dayPlan.day;
          return (
            <div
              key={dayPlan.day}
              className={`border rounded-2xl transition-all overflow-hidden ${
                isExpanded ? 'bg-slate-900 border-indigo-500/50 shadow-xl' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Day Header Accordion Toggle */}
              <div
                onClick={() => setExpandedDay(isExpanded ? 0 : dayPlan.day)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                    D{dayPlan.day}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {dayPlan.title}
                    </h3>
                    <p className="text-xs text-slate-400">{dayPlan.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {dayPlan.estimatedHours}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Day Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-5">
                  {/* Key Goals List */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Day {dayPlan.day} Milestones &amp; Objectives
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                      {dayPlan.goals.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Step-by-Step Task Breakdown
                    </div>

                    {dayPlan.tasks.map((task, idx) => {
                      const taskId = `${dayPlan.day}.${idx + 1}`;
                      const isDone = completedTasks[taskId] || false;

                      return (
                        <div
                          key={taskId}
                          className={`p-4 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-slate-950/40 border-slate-800/60 opacity-90'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => toggleTask(taskId)}
                                className="mt-0.5 text-indigo-400 hover:text-indigo-300 focus:outline-none"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                              <div>
                                <h4
                                  className={`text-sm font-semibold ${
                                    isDone ? 'line-through text-slate-400' : 'text-white'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              Step {taskId}
                            </span>
                          </div>

                          {/* Code snippet if present */}
                          {task.codeSnippet && (
                            <div className="mt-3 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                              <pre>{task.codeSnippet}</pre>
                            </div>
                          )}

                          {/* Pitfall avoided callout */}
                          <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Pitfall Avoided:</strong> {task.pitfallAvoided}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
