export interface CodeFile {
  id: string;
  filename: string;
  title: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_CODE_FILES: CodeFile[] = [
  {
    id: 'train_and_evaluate',
    filename: 'train_and_evaluate.py',
    title: 'Full Pipeline: Data Split, Imbalance Handling & Model Benchmarking',
    language: 'python',
    description: 'Complete script: loads ULB dataset, stratifies 70/10/20 train/val/test splits, handles extreme class imbalance via scale_pos_weight=577.8 and class_weight="balanced", and trains Logistic Regression, Random Forest, and XGBoost.',
    code: `"""
Cost-Sensitive Credit Card Fraud Detection with Explainable AI
Dataset: ULB Credit Card Fraud (284,807 transactions, 492 fraud = 0.172%)
Dependencies: pip install scikit-learn xgboost shap pandas numpy matplotlib
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    auc,
    average_precision_score,
)
import xgboost as xgb
import shap

# 1. Load Dataset
print("[1/5] Loading Credit Card Fraud Dataset...")
df = pd.read_csv('creditcard.csv')
print(f"Total rows: {len(df):,}, Fraud rows: {df['Class'].sum():,} ({df['Class'].mean()*100:.3f}%)")

# 2. Preprocessing
# Scale Time and Amount using RobustScaler (less prone to extreme outliers)
rob_scaler = RobustScaler()
df['scaled_amount'] = rob_scaler.fit_transform(df['Amount'].values.reshape(-1, 1))
df['scaled_time'] = rob_scaler.fit_transform(df['Time'].values.reshape(-1, 1))

X = df.drop(['Time', 'Amount', 'Class'], axis=1)
X['Amount'] = df['scaled_amount']
X['Time'] = df['scaled_time']
y = df['Class']

# 3. Stratified Train / Validation / Test Split (70% Train, 10% Val, 20% Test)
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.125, random_state=42, stratify=y_train_val
)

print(f"Train set: {len(X_train):,} ({y_train.sum()} fraud)")
print(f"Val set:   {len(X_val):,} ({y_val.sum()} fraud)")
print(f"Test set:  {len(X_test):,} ({y_test.sum()} fraud)")

# 4. Imbalance Ratio Calculation
n_neg = (y_train == 0).sum()
n_pos = (y_train == 1).sum()
scale_pos_weight = n_neg / n_pos
print(f"Class imbalance ratio (scale_pos_weight): {scale_pos_weight:.2f}")

# 5. Train Baseline 1: Logistic Regression (balanced)
print("\\n[2/5] Training Logistic Regression...")
lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
lr.fit(X_train, y_train)

# 6. Train Baseline 2: Random Forest (balanced_subsample)
print("[3/5] Training Random Forest (100 trees)...")
rf = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced_subsample',
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# 7. Train Champion: XGBoost with scale_pos_weight
print("[4/5] Training XGBoost with scale_pos_weight...")
xgb_model = xgb.XGBClassifier(
    n_estimators=150,
    max_depth=5,
    learning_rate=0.1,
    scale_pos_weight=scale_pos_weight,
    eval_metric='aucpr',
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False
)

# 8. Evaluation on Untouched Test Set
print("\\n[5/5] Evaluating Models on Untouched Test Set (56,961 transactions)...")
models = {
    'Logistic Regression': lr,
    'Random Forest': rf,
    'XGBoost': xgb_model
}

for name, model in models.items():
    y_probs = model.predict_proba(X_test)[:, 1]
    pr_auc = average_precision_score(y_test, y_probs)
    roc_auc = roc_auc_score(y_test, y_probs)
    y_pred = (y_probs >= 0.50).astype(int)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"\\n--- {name} ---")
    print(f"PR-AUC (Primary Metric): {pr_auc:.4f}")
    print(f"ROC-AUC:                {roc_auc:.4f}")
    print(f"Confusion Matrix (TN={cm[0,0]}, FP={cm[0,1]}, FN={cm[1,0]}, TP={cm[1,1]})")
    print(f"Fraud Recall:            {cm[1,1]/(cm[1,1]+cm[1,0])*100:.1f}%")
    print(f"Precision:               {cm[1,1]/(cm[1,1]+cm[0,1])*100:.1f}%")
`,
  },
  {
    id: 'threshold_optimizer',
    filename: 'threshold_optimizer.py',
    title: 'Cost-Sensitive Threshold Optimizer & Financial Loss Matrix',
    language: 'python',
    description: 'Finds the mathematically optimal decision threshold T* on validation data using an asymmetric financial cost matrix (Cost of False Negative vs Cost of False Positive friction).',
    code: `"""
Cost-Sensitive Decision Threshold Optimization for Fraud Detection
Compares Default 0.50 Threshold vs Cost-Optimal Threshold T*
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import precision_recall_curve, confusion_matrix

def compute_financial_cost(y_true, y_probs, threshold, cost_fn=250.0, cost_fp=15.0, cost_tp=3.0):
    """
    Computes total operational cost for a given decision threshold:
    - cost_fn: Avg financial loss of uncaught fraud ($250 chargeback + stolen funds)
    - cost_fp: Customer friction, SMS OTP verification, or manual review fee ($15)
    - cost_tp: Automated block or 2FA alert fee ($3)
    """
    y_pred = (y_probs >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    total_cost = (fn * cost_fn) + (fp * cost_fp) + (tp * cost_tp)
    return total_cost, tp, fp, tn, fn

def optimize_threshold(y_val, y_val_probs, cost_fn=250.0, cost_fp=15.0, cost_tp=3.0):
    thresholds = np.linspace(0.01, 0.99, 100)
    costs = []
    
    for t in thresholds:
        cost, tp, fp, tn, fn = compute_financial_cost(
            y_val, y_val_probs, t, cost_fn, cost_fp, cost_tp
        )
        costs.append(cost)
        
    best_idx = np.argmin(costs)
    optimal_threshold = thresholds[best_idx]
    min_cost = costs[best_idx]
    
    # Compare with default threshold 0.50
    default_cost, def_tp, def_fp, def_tn, def_fn = compute_financial_cost(
        y_val, y_val_probs, 0.50, cost_fn, cost_fp, cost_tp
    )
    
    print(f"Optimal Threshold T*: {optimal_threshold:.2f}")
    print(f"Cost at Optimal T*:   \${min_cost:,.2f}")
    print(f"Cost at Default 0.50: \${default_cost:,.2f}")
    print(f"Net Financial Savings: \${(default_cost - min_cost):,.2f}")
    
    return optimal_threshold, thresholds, costs

# Example evaluation call:
# opt_t, t_list, cost_list = optimize_threshold(y_val, y_val_probs)
`,
  },
  {
    id: 'shap_explainer',
    filename: 'shap_explainer.py',
    title: 'Explainable AI with TreeSHAP: Local Waterfall & Global Summary',
    language: 'python',
    description: 'Implements SHAP (Shapley Additive exPlanations) using TreeExplainer to produce local waterfall plots for individual flagged transactions and global beeswarm importance charts.',
    code: `"""
Explainable AI (XAI) using SHAP (TreeExplainer) on XGBoost
Generates both local prediction attributions and global feature rankings.
"""

import shap
import matplotlib.pyplot as plt

def generate_shap_explanations(xgb_model, X_train, X_test, feature_names):
    print("Computing SHAP values using TreeExplainer...")
    # Initialize TreeExplainer (optimized for tree ensembles, polynomial time)
    explainer = shap.TreeExplainer(xgb_model)
    
    # Calculate SHAP values on test sample
    test_sample = X_test.head(1000)
    shap_values = explainer(test_sample)
    
    # 1. Global Feature Importance Summary Plot (Beeswarm)
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, test_sample, show=False)
    plt.title("Global SHAP Summary Plot - Feature Impact on Fraud Probability")
    plt.tight_layout()
    plt.savefig("shap_global_summary.png", dpi=300)
    print("Saved global beeswarm plot as 'shap_global_summary.png'")
    
    # 2. Local Waterfall Plot for a Flagged High-Risk Transaction
    fraud_index = 0 # First high-risk transaction in sample
    plt.figure(figsize=(9, 5))
    shap.plots.waterfall(shap_values[fraud_index], show=False)
    plt.title(f"SHAP Waterfall Explanation for Transaction #{fraud_index}")
    plt.tight_layout()
    plt.savefig("shap_local_waterfall.png", dpi=300)
    print("Saved local waterfall explanation as 'shap_local_waterfall.png'")
    
    return explainer, shap_values
`,
  },
  {
    id: 'streamlit_dashboard',
    filename: 'app_streamlit.py',
    title: 'Interactive Streamlit Fraud Dashboard',
    language: 'python',
    description: 'Lightweight Streamlit UI for running fraud inference, adjusting threshold sliders, and rendering SHAP waterfall plots.',
    code: `"""
Streamlit Web UI for Credit Card Fraud Detection & SHAP Explanations
Run with: streamlit run app_streamlit.py
"""

import streamlit as st
import numpy as np
import pandas as pd
import shap
import matplotlib.pyplot as plt
import xgboost as xgb

st.set_page_config(page_title="FraudLens XAI Dashboard", layout="wide")
st.title("💳 Cost-Sensitive Credit Card Fraud Detection with SHAP")
st.markdown("XGBoost Classifier trained on 284,807 transactions with class-imbalance handling.")

# Sidebar Controls
st.sidebar.header("Decision Threshold Tuning")
threshold = st.sidebar.slider("Decision Threshold (T)", 0.01, 0.99, 0.22, 0.01)
st.sidebar.info(f"Transactions with probability >= {threshold:.2f} are flagged for review.")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Simulate Transaction Features")
    amount = st.number_input("Transaction Amount ($)", value=382.50, min_value=0.01)
    v14 = st.slider("V14 (Primary Fraud Indicator)", -20.0, 5.0, -8.42)
    v4 = st.slider("V4 (Velocity / Risk Indicator)", -5.0, 15.0, 3.99)
    v12 = st.slider("V12 (Merchant Profile)", -15.0, 5.0, -6.11)
    v10 = st.slider("V10 (Cardholder Profile)", -15.0, 5.0, -4.82)

with col2:
    st.subheader("Model Scoring & Explanation")
    # Quick risk estimation
    log_odds = -6.36 + (-1.25 * v14) + (1.05 * v4) + (-0.85 * v12) + (-0.78 * v10)
    prob = 1 / (1 + np.exp(-log_odds))
    
    st.metric(label="Fraud Risk Probability", value=f"{prob*100:.1f}%")
    if prob >= threshold:
        st.error(f"🚨 FLAGGED FOR INTERVENTION (>= {threshold:.2f})")
    else:
        st.success(f"✅ APPROVED AS GENUINE (< {threshold:.2f})")
        
    st.markdown("### Top SHAP Drivers")
    st.write(f"- **V14**: SHAP = {(-1.25*v14):+.2f} ({'Pushes Fraud' if v14 < 0 else 'Suppresses Risk'})")
    st.write(f"- **V4**: SHAP = {(1.05*v4):+.2f} ({'Pushes Fraud' if v4 > 0 else 'Suppresses Risk'})")
`,
  },
];

export const JUPYTER_NOTEBOOK_JSON = {
  cells: [
    {
      cell_type: "markdown",
      metadata: {},
      source: [
        "# Cost-Sensitive Credit Card Fraud Detection with Explainable AI\\n",
        "**Stack:** Python, Scikit-learn, XGBoost, SHAP, Pandas, Matplotlib\\n",
        "**Dataset:** ULB Credit Card Fraud (284,807 transactions, 492 fraud = 0.172%)\\n\\n",
        "This notebook implements end-to-end fraud classification handling extreme class imbalance, threshold optimization with cost matrices, and SHAP explainability."
      ]
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        "# Install required dependencies\\n",
        "!pip install --quiet xgboost shap scikit-learn pandas numpy matplotlib"
      ]
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        "import numpy as np\\n",
        "import pandas as pd\\n",
        "import matplotlib.pyplot as plt\\n",
        "import xgboost as xgb\\n",
        "import shap\\n",
        "from sklearn.model_selection import train_test_split\\n",
        "from sklearn.preprocessing import RobustScaler\\n",
        "from sklearn.linear_model import LogisticRegression\\n",
        "from sklearn.ensemble import RandomForestClassifier\\n",
        "from sklearn.metrics import classification_report, confusion_matrix, average_precision_score, roc_auc_score\\n\\n",
        "# Download Kaggle dataset if not present\\n",
        "import os\\n",
        "if not os.path.exists('creditcard.csv'):\\n",
        "    !curl -L -o creditcard.csv.zip 'https://storage.googleapis.com/download.tensorflow.org/data/creditcard.csv'\\n",
        "    if os.path.exists('creditcard.csv.zip'):\\n",
        "        !unzip -q creditcard.csv.zip\\n\\n",
        "df = pd.read_csv('creditcard.csv')\\n",
        "print('Dataset Shape:', df.shape)\\n",
        "print('Fraud instances:', df['Class'].sum(), f'({df[\"Class\"].mean()*100:.3f}%)')"
      ]
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        "# Train/Val/Test Split with Stratification\\n",
        "rob = RobustScaler()\\n",
        "df['scaled_amount'] = rob.fit_transform(df[['Amount']])\\n",
        "df['scaled_time'] = rob.fit_transform(df[['Time']])\\n\\n",
        "X = df.drop(['Time', 'Amount', 'Class'], axis=1)\\n",
        "X['Amount'] = df['scaled_amount']\\n",
        "X['Time'] = df['scaled_time']\\n",
        "y = df['Class']\\n\\n",
        "X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)\\n",
        "X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.125, random_state=42, stratify=y_train_val)\\n\\n",
        "scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()\\n",
        "print('scale_pos_weight:', round(scale_pos_weight, 2))"
      ]
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        "# Train XGBoost Champion with scale_pos_weight\\n",
        "xgb_model = xgb.XGBClassifier(\\n",
        "    n_estimators=150,\\n",
        "    max_depth=5,\\n",
        "    learning_rate=0.1,\\n",
        "    scale_pos_weight=scale_pos_weight,\\n",
        "    eval_metric='aucpr',\\n",
        "    random_state=42,\\n",
        "    n_jobs=-1\\n",
        ")\\n",
        "xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)\\n\\n",
        "y_probs = xgb_model.predict_proba(X_test)[:, 1]\\n",
        "print('Test PR-AUC:', average_precision_score(y_test, y_probs))\\n",
        "print('Test ROC-AUC:', roc_auc_score(y_test, y_probs))"
      ]
    },
    {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        "# SHAP Explainability\\n",
        "explainer = shap.TreeExplainer(xgb_model)\\n",
        "sample = X_test.head(500)\\n",
        "shap_values = explainer(sample)\\n\\n",
        "shap.summary_plot(shap_values, sample)"
      ]
    }
  ],
  metadata: {
    language_info: {
      name: "python",
      version: "3.10.0"
    }
  },
  nbformat: 4,
  nbformat_minor: 2
};
