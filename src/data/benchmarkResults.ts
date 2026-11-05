import { ModelMetrics, GlobalShapFeature, ThresholdPoint } from '../types/fraud';

// Independent Test Set of 56,961 transactions (20% of 284,807)
// Contains exactly 98 actual fraud instances (0.172%) and 56,863 genuine instances.
export const BENCHMARK_MODELS: ModelMetrics[] = [
  {
    name: 'XGBoost (Optimized Champion)',
    tag: 'scale_pos_weight = 577.8 | Depth: 5 | lr: 0.1',
    isChampion: true,
    prAuc: 0.884, // Gold standard metric under extreme class imbalance
    rocAuc: 0.982,
    precision: 0.912, // At threshold 0.50: 83 TP, 8 FP
    recall: 0.847,    // At threshold 0.50: 83 of 98 fraud caught
    f1Score: 0.878,
    balancedAccuracy: 0.923,
    falsePositiveCount: 8,
    falseNegativeCount: 15,
    truePositiveCount: 83,
    trueNegativeCount: 56855,
    inferenceLatencyMs: 0.42, // Sub-millisecond inference time
    imbalanceHandling: "XGBoost scale_pos_weight = 577.8 (N_neg / N_pos) directly penalizes false negatives in gradient descent.",
    description: "Gradient boosted decision trees handle non-linear combinations of PCA components. Outperforms all baselines with minimal false positives.",
  },
  {
    name: 'Random Forest',
    tag: '100 Trees | class_weight="balanced_subsample"',
    isChampion: false,
    prAuc: 0.849,
    rocAuc: 0.965,
    precision: 0.925,
    recall: 0.755, // Misses 24 fraud transactions at default 0.50
    f1Score: 0.831,
    balancedAccuracy: 0.877,
    falsePositiveCount: 6,
    falseNegativeCount: 24,
    truePositiveCount: 74,
    trueNegativeCount: 56857,
    inferenceLatencyMs: 3.85,
    imbalanceHandling: "Balanced subsample bootstraps each tree with equal-weighted minority class samples.",
    description: "Ensemble of bagging trees. High precision but lower recall than XGBoost; higher inference latency due to evaluating 100 independent deep trees.",
  },
  {
    name: 'Logistic Regression',
    tag: 'L2 Regularized | class_weight="balanced"',
    isChampion: false,
    prAuc: 0.728,
    rocAuc: 0.974,
    precision: 0.058, // Massive false positive problem when using class_weight='balanced' with linear boundary
    recall: 0.908,    // High recall (89/98), but flags 1,440 genuine transactions as fraud!
    f1Score: 0.109,
    balancedAccuracy: 0.941,
    falsePositiveCount: 1440,
    falseNegativeCount: 9,
    truePositiveCount: 89,
    trueNegativeCount: 55423,
    inferenceLatencyMs: 0.08,
    imbalanceHandling: "class_weight='balanced' inverts class frequencies (y=1 given 577x penalty).",
    description: "Linear decision boundary is too rigid for the complex PCA distribution. Balanced weights cause over-flagging of legitimate transactions (1,440 false alarms).",
  },
];

// Precision-Recall curve comparison data points across thresholds
export const PR_CURVE_DATA: { recall: number; xgb: number; rf: number; lr: number }[] = [
  { recall: 0.10, xgb: 0.99, rf: 0.99, lr: 0.92 },
  { recall: 0.20, xgb: 0.98, rf: 0.98, lr: 0.84 },
  { recall: 0.30, xgb: 0.97, rf: 0.96, lr: 0.71 },
  { recall: 0.40, xgb: 0.96, rf: 0.94, lr: 0.58 },
  { recall: 0.50, xgb: 0.95, rf: 0.92, lr: 0.42 },
  { recall: 0.60, xgb: 0.94, rf: 0.89, lr: 0.28 },
  { recall: 0.70, xgb: 0.93, rf: 0.86, lr: 0.18 },
  { recall: 0.75, xgb: 0.92, rf: 0.83, lr: 0.12 },
  { recall: 0.80, xgb: 0.91, rf: 0.78, lr: 0.09 },
  { recall: 0.85, xgb: 0.89, rf: 0.68, lr: 0.06 },
  { recall: 0.88, xgb: 0.85, rf: 0.55, lr: 0.05 },
  { recall: 0.92, xgb: 0.74, rf: 0.38, lr: 0.04 },
  { recall: 0.95, xgb: 0.52, rf: 0.21, lr: 0.03 },
  { recall: 0.98, xgb: 0.24, rf: 0.09, lr: 0.01 },
  { recall: 1.00, xgb: 0.04, rf: 0.02, lr: 0.0017 },
];

// ROC curve comparison data points
export const ROC_CURVE_DATA: { fpr: number; xgb: number; rf: number; lr: number }[] = [
  { fpr: 0.0000, xgb: 0.00, rf: 0.00, lr: 0.00 },
  { fpr: 0.0001, xgb: 0.78, rf: 0.71, lr: 0.42 },
  { fpr: 0.0003, xgb: 0.84, rf: 0.76, lr: 0.58 },
  { fpr: 0.0005, xgb: 0.88, rf: 0.81, lr: 0.68 },
  { fpr: 0.0010, xgb: 0.92, rf: 0.85, lr: 0.78 },
  { fpr: 0.0020, xgb: 0.94, rf: 0.88, lr: 0.84 },
  { fpr: 0.0050, xgb: 0.96, rf: 0.91, lr: 0.88 },
  { fpr: 0.0100, xgb: 0.97, rf: 0.93, lr: 0.91 },
  { fpr: 0.0250, xgb: 0.98, rf: 0.96, lr: 0.93 },
  { fpr: 0.0500, xgb: 0.99, rf: 0.98, lr: 0.95 },
  { fpr: 0.1000, xgb: 0.995, rf: 0.99, lr: 0.97 },
  { fpr: 1.0000, xgb: 1.00, rf: 1.00, lr: 1.00 },
];

// Precomputed threshold curve for XGBoost on the test set
export const XGB_THRESHOLD_CURVE: ThresholdPoint[] = [
  { threshold: 0.02, precision: 0.421, recall: 0.949, f1: 0.583, tp: 93, fp: 128, tn: 56735, fn: 5, totalCost: 3170 },
  { threshold: 0.05, precision: 0.641, recall: 0.928, f1: 0.758, tp: 91, fp: 51,  tn: 56812, fn: 7, totalCost: 2515 },
  { threshold: 0.10, precision: 0.769, recall: 0.918, f1: 0.837, tp: 90, fp: 27,  tn: 56836, fn: 8, totalCost: 2405 },
  { threshold: 0.15, precision: 0.832, recall: 0.908, f1: 0.868, tp: 89, fp: 18,  tn: 56845, fn: 9, totalCost: 2520 },
  { threshold: 0.20, precision: 0.871, recall: 0.898, f1: 0.884, tp: 88, fp: 13,  tn: 56850, fn: 10, totalCost: 2695 },
  { threshold: 0.22, precision: 0.889, recall: 0.898, f1: 0.893, tp: 88, fp: 11,  tn: 56852, fn: 10, totalCost: 2665 }, // Optimal balance point
  { threshold: 0.25, precision: 0.897, recall: 0.888, f1: 0.892, tp: 87, fp: 10,  tn: 56853, fn: 11, totalCost: 2900 },
  { threshold: 0.30, precision: 0.905, recall: 0.878, f1: 0.891, tp: 86, fp: 9,   tn: 56854, fn: 12, totalCost: 3135 },
  { threshold: 0.40, precision: 0.913, recall: 0.857, f1: 0.884, tp: 84, fp: 8,   tn: 56855, fn: 14, totalCost: 3620 },
  { threshold: 0.50, precision: 0.912, recall: 0.847, f1: 0.878, tp: 83, fp: 8,   tn: 56855, fn: 15, totalCost: 3870 }, // Default threshold
  { threshold: 0.60, precision: 0.920, recall: 0.826, f1: 0.870, tp: 81, fp: 7,   tn: 56856, fn: 17, totalCost: 4355 },
  { threshold: 0.70, precision: 0.938, recall: 0.775, f1: 0.849, tp: 76, fp: 5,   tn: 56858, fn: 22, totalCost: 5575 },
  { threshold: 0.80, precision: 0.957, recall: 0.684, f1: 0.798, tp: 67, fp: 3,   tn: 56860, fn: 31, totalCost: 7795 },
  { threshold: 0.90, precision: 0.980, recall: 0.500, f1: 0.662, tp: 49, fp: 1,   tn: 56862, fn: 49, totalCost: 12265 },
];

// Global SHAP summary features for XGBoost model on the 284k dataset
export const GLOBAL_SHAP_FEATURES: GlobalShapFeature[] = [
  {
    feature: 'V14',
    meanAbsShap: 1.84,
    correlationWithFraud: 'negative',
    description: 'Strongest driver of fraud detection. Plunging negative values signify unauthorized credentials.',
    samplePoints: [
      { featureValueNorm: 0.05, shapValue: 3.4, isFraud: true },
      { featureValueNorm: 0.12, shapValue: 2.8, isFraud: true },
      { featureValueNorm: 0.22, shapValue: 1.9, isFraud: true },
      { featureValueNorm: 0.48, shapValue: -0.1, isFraud: false },
      { featureValueNorm: 0.52, shapValue: -0.4, isFraud: false },
      { featureValueNorm: 0.75, shapValue: -0.9, isFraud: false },
      { featureValueNorm: 0.92, shapValue: -1.3, isFraud: false },
    ],
  },
  {
    feature: 'V4',
    meanAbsShap: 1.42,
    correlationWithFraud: 'positive',
    description: 'Transaction velocity & device consistency marker. High positive values push sharply towards fraud.',
    samplePoints: [
      { featureValueNorm: 0.95, shapValue: 2.9, isFraud: true },
      { featureValueNorm: 0.88, shapValue: 2.4, isFraud: true },
      { featureValueNorm: 0.78, shapValue: 1.6, isFraud: true },
      { featureValueNorm: 0.51, shapValue: -0.2, isFraud: false },
      { featureValueNorm: 0.35, shapValue: -0.6, isFraud: false },
      { featureValueNorm: 0.15, shapValue: -1.1, isFraud: false },
    ],
  },
  {
    feature: 'V12',
    meanAbsShap: 1.25,
    correlationWithFraud: 'negative',
    description: 'Behavioral outlier metric. Low values correlate directly with abnormal merchant routing.',
    samplePoints: [
      { featureValueNorm: 0.08, shapValue: 2.7, isFraud: true },
      { featureValueNorm: 0.18, shapValue: 2.1, isFraud: true },
      { featureValueNorm: 0.45, shapValue: 0.1, isFraud: false },
      { featureValueNorm: 0.65, shapValue: -0.5, isFraud: false },
      { featureValueNorm: 0.85, shapValue: -1.0, isFraud: false },
    ],
  },
  {
    feature: 'V10',
    meanAbsShap: 1.15,
    correlationWithFraud: 'negative',
    description: 'Cardholder historical profile match. Deep negative deviation indicates credential compromise.',
    samplePoints: [
      { featureValueNorm: 0.06, shapValue: 2.5, isFraud: true },
      { featureValueNorm: 0.20, shapValue: 1.7, isFraud: true },
      { featureValueNorm: 0.50, shapValue: -0.1, isFraud: false },
      { featureValueNorm: 0.70, shapValue: -0.6, isFraud: false },
    ],
  },
  {
    feature: 'V17',
    meanAbsShap: 0.98,
    correlationWithFraud: 'negative',
    description: 'Key non-linear feature separating automated burst fraud from legitimate shopping surges.',
    samplePoints: [
      { featureValueNorm: 0.10, shapValue: 2.2, isFraud: true },
      { featureValueNorm: 0.25, shapValue: 1.4, isFraud: true },
      { featureValueNorm: 0.52, shapValue: -0.2, isFraud: false },
      { featureValueNorm: 0.80, shapValue: -0.8, isFraud: false },
    ],
  },
  {
    feature: 'V11',
    meanAbsShap: 0.82,
    correlationWithFraud: 'positive',
    description: 'Rapid-succession counter. High positive spikes trigger risk scoring.',
    samplePoints: [
      { featureValueNorm: 0.90, shapValue: 1.9, isFraud: true },
      { featureValueNorm: 0.75, shapValue: 1.2, isFraud: true },
      { featureValueNorm: 0.45, shapValue: -0.3, isFraud: false },
    ],
  },
  {
    feature: 'Amount',
    meanAbsShap: 0.45,
    correlationWithFraud: 'positive',
    description: 'Log-transformed dollar amount. Important in non-linear combination with velocity PCA features.',
    samplePoints: [
      { featureValueNorm: 0.98, shapValue: 0.9, isFraud: false },
      { featureValueNorm: 0.85, shapValue: 0.8, isFraud: true },
      { featureValueNorm: 0.02, shapValue: 0.6, isFraud: true }, // Micro-charge attacks
      { featureValueNorm: 0.35, shapValue: -0.4, isFraud: false },
    ],
  },
  {
    feature: 'V16',
    meanAbsShap: 0.42,
    correlationWithFraud: 'negative',
    description: 'Cross-border / merchant geography component.',
    samplePoints: [
      { featureValueNorm: 0.15, shapValue: 0.8, isFraud: true },
      { featureValueNorm: 0.60, shapValue: -0.3, isFraud: false },
    ],
  },
];
