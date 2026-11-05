export interface TransactionFeature {
  name: string;
  value: number;
  description?: string;
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface Transaction {
  id: string;
  label: 'Genuine' | 'Fraud';
  title: string;
  description: string;
  amount: number;
  timeSeconds: number; // Seconds elapsed since first transaction in dataset (0 to 172,792s = 48h)
  features: Record<string, number>; // V1 to V28
}

export interface ModelPrediction {
  modelName: 'Logistic Regression' | 'Random Forest' | 'XGBoost';
  fraudProbability: number;
  prediction: 0 | 1; // At current threshold
  inferenceTimeMs: number;
  confidence: number;
}

export interface SHAPContribution {
  feature: string;
  value: number;
  shapValue: number; // positive = pushes towards fraud, negative = pushes towards legitimate
  direction: 'fraud' | 'legitimate';
  contributionPct: number;
  insight: string;
}

export interface ModelMetrics {
  name: string;
  tag: string;
  isChampion?: boolean;
  prAuc: number;
  rocAuc: number;
  precision: number;
  recall: number;
  f1Score: number;
  balancedAccuracy: number;
  falsePositiveCount: number; // out of ~56,863 test genuine
  falseNegativeCount: number; // out of 98 test fraud
  truePositiveCount: number;
  trueNegativeCount: number;
  inferenceLatencyMs: number;
  imbalanceHandling: string;
  description: string;
}

export interface CostParams {
  costFalseNegative: number; // e.g. $250 avg fraud loss + chargeback fee
  costFalsePositive: number; // e.g. $15 customer friction / manual review
  costTruePositive: number;  // e.g. $3 automated verification SMS / freeze
  costTrueNegative: number;  // $0
  totalTestTransactions: number;
  totalTestFraud: number;
  totalTestGenuine: number;
}

export interface ThresholdPoint {
  threshold: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  totalCost: number;
}

export interface GlobalShapFeature {
  feature: string;
  meanAbsShap: number;
  correlationWithFraud: 'positive' | 'negative';
  description: string;
  samplePoints: {
    featureValueNorm: number; // 0 to 1 (low to high)
    shapValue: number;
    isFraud: boolean;
  }[];
}
