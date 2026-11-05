export interface DatasetStats {
  totalTransactions: number;
  fraudTransactions: number;
  genuineTransactions: number;
  fraudPercentage: number;
  featureCount: number;
  timeSpanHours: number;
  medianFraudAmount: number;
  medianGenuineAmount: number;
  maxAmount: number;
  source: string;
  splitInfo: {
    trainRatio: number;
    valRatio: number;
    testRatio: number;
    trainTotal: number;
    trainFraud: number;
    testTotal: number;
    testFraud: number;
  };
}

export const ULB_DATASET_STATS: DatasetStats = {
  totalTransactions: 284807,
  fraudTransactions: 492,
  genuineTransactions: 284315,
  fraudPercentage: 0.1727, // 0.172%
  featureCount: 30, // Time, Amount, V1-V28 PCA
  timeSpanHours: 48,
  medianFraudAmount: 9.25,
  medianGenuineAmount: 22.00,
  maxAmount: 25691.16,
  source: 'Université Libre de Bruxelles (ULB) & Worldline (Kaggle)',
  splitInfo: {
    trainRatio: 0.70,
    valRatio: 0.10,
    testRatio: 0.20,
    trainTotal: 199364,
    trainFraud: 344,
    testTotal: 56961,
    testFraud: 98,
  },
};

export const PCA_EXPLANATION = {
  title: 'Anonymized PCA Components (V1 to V28)',
  summary:
    'Features V1 through V28 are numerical components resulting from a Principal Component Analysis (PCA) transformation applied to the raw cardholder transaction data.',
  whyAnonymized:
    'To protect cardholder confidentiality and sensitive banking data (e.g. card number, merchant category code, geographical coordinates, device fingerprint, CVV), PCA was applied before publication.',
  untransformedFeatures: [
    {
      name: 'Time',
      description: 'Number of seconds elapsed between this transaction and the first transaction in the dataset (spanning 48 hours). Captures temporal circadian patterns (e.g., higher fraud frequency in late night/early morning hours).',
    },
    {
      name: 'Amount',
      description: 'Transaction amount in Euros. Highly skewed; contains both micro-charges ($0.01 - $1.00 card testing) and high-value attacks.',
    },
    {
      name: 'Class',
      description: 'Binary response variable: 1 for fraudulent transaction, 0 for genuine transaction.',
    },
  ],
  keyFraudDifferentiators: [
    {
      feature: 'V14',
      impact: 'Strongest negative correlation with fraud. Genuine transactions cluster around 0.0 (std ~ 0.9), whereas fraud instances plunge into deep negative values (-4.0 to -19.0).',
    },
    {
      feature: 'V4',
      impact: 'Strong positive correlation. Genuine transactions average ~0.0, while fraud transactions shift upward (+2.5 to +12.0), indicating anomalous velocity/device mismatch.',
    },
    {
      feature: 'V12',
      impact: 'Strong negative correlation. Large negative values (-3.0 to -15.0) heavily correlate with unauthorized card-not-present fraud.',
    },
    {
      feature: 'V10',
      impact: 'Strong negative correlation. Fraud exhibits severe negative shift; critical feature for XGBoost split logic.',
    },
    {
      feature: 'V17',
      impact: 'Negative correlation. Strong non-linear discriminator that separates sophisticated automated attack vectors from genuine spikes.',
    },
    {
      feature: 'V11',
      impact: 'Positive correlation. Elevated values (+1.5 to +8.0) indicate rapid transaction succession or high risk propensity.',
    },
  ],
};
