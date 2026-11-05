import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TransactionSimulator } from './components/TransactionSimulator';
import { ThresholdOptimizer } from './components/ThresholdOptimizer';
import { ModelBenchmarks } from './components/ModelBenchmarks';
import { ShapExplorer } from './components/ShapExplorer';
import { ImplementationPlan } from './components/ImplementationPlan';
import { CodeExporter } from './components/CodeExporter';
import { ResumePositioning } from './components/ResumePositioning';
import { ShieldCheck, BookOpen, ExternalLink, GitBranch, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'simulator' && <TransactionSimulator />}
        {activeTab === 'threshold' && <ThresholdOptimizer />}
        {activeTab === 'benchmarks' && <ModelBenchmarks />}
        {activeTab === 'shap' && <ShapExplorer />}
        {activeTab === 'roadmap' && <ImplementationPlan />}
        {activeTab === 'code' && <CodeExporter />}
        {activeTab === 'resume' && <ResumePositioning />}
      </main>

      {/* Academic & Production Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>FraudLens XAI Lab</strong> • Built with Open-Source Python, Scikit-learn, XGBoost &amp; SHAP
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="text-slate-600">Dataset: ULB / Worldline (284,807 transactions)</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-slate-600">XAI: Lundberg &amp; Lee (NeurIPS 2017)</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <button
              onClick={() => setActiveTab('code')}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" /> Get Code &amp; Colab
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
