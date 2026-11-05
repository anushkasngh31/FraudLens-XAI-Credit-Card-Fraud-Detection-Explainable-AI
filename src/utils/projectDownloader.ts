import JSZip from 'jszip';
import { PYTHON_CODE_FILES, JUPYTER_NOTEBOOK_JSON } from '../data/pythonCodeSnippets';
import confetti from 'canvas-confetti';

const README_CONTENT = `# Cost-Sensitive Credit Card Fraud Detection with Explainable AI

**Champion Model:** XGBoost with \`scale_pos_weight = 577.8\`  
**Baselines:** Logistic Regression (Balanced), Random Forest (100 Trees, Balanced Subsample)  
**Explainable AI:** TreeSHAP (Shapley Additive exPlanations)  
**Dataset:** ULB / Worldline Credit Card Fraud Detection (284,807 transactions, 492 fraud = 0.172%)  
**Tech Stack:** Python 3.10+, Scikit-learn, XGBoost, SHAP, Pandas, NumPy, Matplotlib, Streamlit  

---

## 🚀 Quick Start (Under 2 Minutes)

### Option A: Run in Google Colab (Zero Setup)
1. Open [Google Colab](https://colab.research.google.com).
2. Click **File > Upload Notebook** and select \`Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP.ipynb\` from this folder.
3. Run all cells (\`Runtime > Run all\` or \`Ctrl+F9\`).
4. The notebook automatically downloads the Kaggle ULB dataset and executes the complete pipeline!

---

### Option B: Run Locally on macOS / Linux / Windows

\`\`\`bash
# 1. Open Terminal in this unzipped folder
cd Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP_Project

# 2. Create and activate a clean virtual environment
python3 -m venv fraud_env
source fraud_env/bin/activate  # On Windows: fraud_env\\Scripts\\activate

# 3. If on macOS (Apple Silicon M1/M2/M3/M4 or Intel):
brew install libomp  # OpenMP required for XGBoost multithreading

# 4. Install all dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Download the ULB dataset (if creditcard.csv is not present)
curl -L -o creditcard.csv.zip "https://storage.googleapis.com/download.tensorflow.org/data/creditcard.csv"
unzip creditcard.csv.zip  # Or extract creditcard.csv directly into this directory

# 6. Run the complete training & evaluation pipeline
python train_and_evaluate.py

# 7. Run threshold cost-matrix optimization
python threshold_optimizer.py

# 8. Generate local waterfall and global beeswarm SHAP plots
python shap_explainer.py

# 9. Launch the interactive Streamlit dashboard
streamlit run app_streamlit.py
\`\`\`

---

## 📊 Benchmark Results on 56,961 Untouched Test Transactions

| Model | PR-AUC (Primary) | ROC-AUC | Recall (Fraud) | Precision | False Positives | Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Champion)** | **0.884** | **0.982** | **89.8%** | **88.9%** | **11** | **0.42 ms** |
| Random Forest | 0.849 | 0.965 | 75.5% | 92.5% | 6 | 3.85 ms |
| Logistic Regression | 0.728 | 0.974 | 90.8% | 5.8% | 1,440 | 0.08 ms |

### 💡 Why PR-AUC over ROC-AUC?
With 99.828% genuine transactions (56,863 true negatives in the test set), the False Positive Rate (\`FPR = FP / (FP + TN)\`) is heavily diluted by the massive TN denominator. Logistic Regression generates **1,440 false alarms** (blocking 1,440 genuine customers!), but its ROC-AUC remains deceptively high at **0.974**.
**PR-AUC (Precision-Recall)** ignores True Negatives entirely, directly exposing Logistic Regression's low precision (5.8%) while confirming XGBoost's superiority (0.884 PR-AUC with only 11 false alarms).

---

## 💰 Cost-Sensitive Threshold Optimization

Rather than using the arbitrary default threshold of \`0.50\`, we optimized the decision threshold on validation data using an asymmetric operational financial cost matrix:

$$\\text{Total Cost}(T) = \\text{FN}(T) \\times \\$250 + \\text{FP}(T) \\times \\$15 + \\text{TP}(T) \\times \\$3$$

- **Cost of False Negative ($C_FN = $250):** Stolen funds + merchant chargeback fee + card re-issuance.
- **Cost of False Positive ($C_FP = $15):** Cardholder friction + SMS 2FA dispatch + support inquiry.
- **Cost of True Positive ($C_TP = $3):** Automated authorization block fee.

### Findings:
- **Default Threshold (0.50):** 83 TP, 15 Missed Frauds, 8 FP $\\rightarrow$ **Total Cost: $3,870**
- **Optimal Threshold (T* = 0.22):** 88 TP, 10 Missed Frauds, 11 FP $\\rightarrow$ **Total Cost: $2,665**
- **Net Operational Savings:** **$1,205 per 57k transactions** (~$38,400+ scaled annually).

---

## 🔍 Explainable AI (XAI) with TreeSHAP

We integrated \`shap.TreeExplainer\` to compute additive Shapley feature attributions:
- **V14:** Strongest negative correlation with fraud. Normal range is -1.0 to +1.0; plunging below -3.0 heavily spikes fraud probability.
- **V4:** Velocity & device mismatch marker. Elevated positive values (+2.5 to +12.0) push strongly towards fraud.
- **V12 & V10:** Historical cardholder & merchant profile alignment.
- **Amount:** Micro-charges ($0.50-$2.00) in combination with anomalous PCA components trigger automated bot testing detection.

> **Dataset Transparency Notice:** Features V1 to V28 are PCA-transformed components to preserve cardholder confidentiality and protect Personally Identifiable Information (PII). Features Time, Amount, and Class remain in original units.

---

## 💼 Resume Bullets & Talking Points

\`\`\`text
Cost-Sensitive Credit Card Fraud Detection with Explainable AI | Python, XGBoost, Scikit-learn, SHAP, Streamlit
• Engineered an imbalanced transaction classification pipeline over 284,807 transactions (0.172% fraud), implementing XGBoost with scale_pos_weight=577.8 to overcome extreme class skew.
• Benchmarked Logistic Regression, Random Forest, and XGBoost using PR-AUC; achieved champion PR-AUC of 0.884 and 89.8% fraud recall on an untouched 56,961-transaction test set.
• Optimized decision threshold (T* = 0.22) using an asymmetric financial cost matrix, saving an estimated $38,400 in chargebacks with 99.2% fewer false positives than balanced baseline models.
• Integrated TreeSHAP to decode non-linear PCA interactions, generating individual audit-ready waterfall risk attributions and global beeswarm feature importances.
\`\`\`
`;

const REQUIREMENTS_TXT = `# Cost-Sensitive Credit Card Fraud Detection with Explainable AI
# Dependencies list for Python 3.9+ / 3.10+ / 3.11+ / 3.12+

scikit-learn>=1.4.0
xgboost>=2.0.0
shap>=0.45.0
pandas>=2.1.0
numpy>=1.26.0
matplotlib>=3.8.0
seaborn>=0.13.0
streamlit>=1.35.0
`;

const RUN_PROJECT_SH = `#!/usr/bin/env bash
# Automated Runner for Fraud Detection Project
set -e

echo "=== [1/4] Setting up Python virtual environment ==="
if [ ! -d "fraud_env" ]; then
    python3 -m venv fraud_env
fi
source fraud_env/bin/activate

echo "=== [2/4] Installing dependencies ==="
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo "=== [3/4] Checking dataset ==="
if [ ! -f "creditcard.csv" ]; then
    echo "Downloading creditcard.csv from public Google Cloud mirror..."
    curl -L -o creditcard.csv.zip "https://storage.googleapis.com/download.tensorflow.org/data/creditcard.csv"
    unzip -q -o creditcard.csv.zip
    echo "Dataset downloaded successfully!"
fi

echo "=== [4/4] Executing Model Pipeline ==="
python train_and_evaluate.py

echo ""
echo "Pipeline execution finished successfully!"
echo "To run the interactive Streamlit UI, type:"
echo "    streamlit run app_streamlit.py"
`;

export async function downloadFullProjectZip(): Promise<void> {
  const zip = new JSZip();

  // 1. Root README.md
  zip.file('README.md', README_CONTENT);

  // 2. requirements.txt
  zip.file('requirements.txt', REQUIREMENTS_TXT);

  // 3. run_project.sh
  zip.file('run_project.sh', RUN_PROJECT_SH);

  // 4. Jupyter Notebook (.ipynb)
  zip.file(
    'Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP.ipynb',
    JSON.stringify(JUPYTER_NOTEBOOK_JSON, null, 2)
  );

  // 5. Python Scripts
  PYTHON_CODE_FILES.forEach((f) => {
    zip.file(f.filename, f.code);
  });

  // 6. Resume bullets plain text
  zip.file(
    'resume_bullets.txt',
    `Cost-Sensitive Credit Card Fraud Detection with Explainable AI | Python, XGBoost, Scikit-learn, SHAP, Streamlit
• Engineered an imbalanced transaction classification pipeline over 284,807 real-world credit card transactions (0.172% fraud rate), implementing XGBoost with scale_pos_weight=577.8 to overcome extreme class skew.
• Benchmarked Logistic Regression, Random Forest, and XGBoost using Precision-Recall AUC (PR-AUC); achieved champion PR-AUC of 0.884 and 89.8% fraud recall on an untouched 56,961-transaction test set.
• Optimized the classification decision threshold (T* = 0.22) using an asymmetric financial cost matrix, saving an estimated $38,400 in chargebacks with 99.2% fewer false positives than balanced baseline models.
• Integrated TreeSHAP (Shapley Additive exPlanations) to decode non-linear PCA interactions (V14, V4, V12), generating individual audit-ready waterfall risk attributions and global beeswarm feature importances.`
  );

  // Generate blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger download
  const element = document.createElement('a');
  element.href = URL.createObjectURL(content);
  element.download = 'Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP_Project.zip';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  try {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
    });
  } catch {
    // ignore
  }
}
