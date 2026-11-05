import React, { useState } from 'react';
import { PYTHON_CODE_FILES, JUPYTER_NOTEBOOK_JSON } from '../data/pythonCodeSnippets';
import { downloadFullProjectZip } from '../utils/projectDownloader';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Laptop,
  Cloud,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CodeExporter: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(PYTHON_CODE_FILES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeEnvironment, setActiveEnvironment] = useState<'colab' | 'mac'>('colab');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const selectedFile =
    PYTHON_CODE_FILES.find((f) => f.id === selectedFileId) || PYTHON_CODE_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  const handleDownloadNotebook = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(JUPYTER_NOTEBOOK_JSON, null, 2)], {
      type: 'application/x-ipynb+json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP.ipynb';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileCode className="w-3.5 h-3.5" />
              Production Python Code &amp; Colab Hub
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready-to-Run Scripts &amp; Jupyter Notebook
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Zero paid AI subscriptions or cloud lock-in. Run entirely on open-source Python, Scikit-learn, XGBoost, and SHAP. Choose between Google Colab or your local machine.
            </p>
          </div>

          {/* Download CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => downloadFullProjectZip()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Full Project ZIP (.zip)</span>
            </button>

            <button
              onClick={handleDownloadNotebook}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-900/40 transition-all self-start lg:self-auto group cursor-pointer"
            >
              <FileCode className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download .ipynb Notebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Package Contents Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Project ZIP includes:</strong> <code className="text-indigo-300">README.md</code>, <code className="text-indigo-300">requirements.txt</code>, <code className="text-indigo-300">train_and_evaluate.py</code>, <code className="text-indigo-300">threshold_optimizer.py</code>, <code className="text-indigo-300">shap_explainer.py</code>, <code className="text-indigo-300">app_streamlit.py</code>, <code className="text-indigo-300">run_project.sh</code>, and <code className="text-indigo-300">Cost_Sensitive_Credit_Card_Fraud_Detection_XGBoost_SHAP.ipynb</code>.
          </span>
        </div>
        <button
          onClick={() => downloadFullProjectZip()}
          className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap flex items-center gap-1 self-start md:self-auto hover:underline"
        >
          <Download className="w-3.5 h-3.5" /> 1-Click Download ZIP
        </button>
      </div>

      {/* Environment Selector: Google Colab vs Local Mac / Linux */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Execution Environment Setup</h3>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveEnvironment('colab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeEnvironment === 'colab'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" /> Google Colab (Recommended)
            </button>
            <button
              onClick={() => setActiveEnvironment('mac')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeEnvironment === 'mac'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> Local Mac / Apple Silicon
            </button>
          </div>
        </div>

        {activeEnvironment === 'colab' ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">
                Option A: Google Colab — 100% Free, Zero Setup Required
              </span>
              <span className="text-[10px] text-slate-500">Fastest Path</span>
            </div>
            <p className="text-slate-400">
              1. Download the notebook using the button above (or open <a href="https://colab.research.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">colab.research.google.com</a>).<br />
              2. Click <strong>File &gt; Upload Notebook</strong> and choose the downloaded <code className="text-indigo-300">.ipynb</code> file.<br />
              3. The notebook automatically fetches the ULB credit card dataset and runs the complete pipeline in under 90 seconds!
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300">
                Option B: Local Python on macOS (Intel or Apple Silicon M1/M2/M3/M4)
              </span>
              <span className="text-[10px] text-slate-500">Local Dev</span>
            </div>
            <p className="text-slate-400">
              Run these commands in your macOS Terminal:
            </p>
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`# 1. Create a clean virtual environment
python3 -m venv fraud_env
source fraud_env/bin/activate

# 2. Install OpenMP (required for XGBoost multithreading on macOS)
brew install libomp

# 3. Install required open-source ML packages
pip install --upgrade pip
pip install scikit-learn xgboost shap pandas numpy matplotlib streamlit

# 4. Run the full training script
python train_and_evaluate.py`}
            </pre>
          </div>
        )}
      </div>

      {/* Code Viewer Tabs & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* File tabs bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {PYTHON_CODE_FILES.map((f) => {
              const isSelected = selectedFileId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFileId(f.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {f.filename}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80">
          <h4 className="text-sm font-bold text-white">{selectedFile.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
          <pre>{selectedFile.code}</pre>
        </div>
      </div>
    </div>
  );
};
