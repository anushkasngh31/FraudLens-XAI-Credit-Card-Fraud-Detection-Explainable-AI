import React from 'react';
import { ShieldAlert, BookOpen, Sliders, Activity, FileCode, Award, Layers, Download } from 'lucide-react';
import { downloadFullProjectZip } from '../utils/projectDownloader';

export type ActiveTab = 'simulator' | 'threshold' | 'benchmarks' | 'shap' | 'roadmap' | 'code' | 'resume';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'simulator', label: 'Live Inference & SHAP', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'threshold', label: 'Cost Threshold Tuning', icon: <Sliders className="w-4 h-4" />, badge: 'ROI' },
    { id: 'benchmarks', label: 'Imbalance Benchmarks', icon: <Activity className="w-4 h-4" /> },
    { id: 'shap', label: 'Global Explainability', icon: <Layers className="w-4 h-4" /> },
    { id: 'roadmap', label: '3-Day Plan', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'code', label: 'Python & Colab Scripts', icon: <FileCode className="w-4 h-4" />, badge: 'Ready' },
    { id: 'resume', label: 'Resume & Interview', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">FraudLens XAI</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  XGBoost + SHAP
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  0.172% Imbalance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cost-Sensitive Credit Card Fraud Detection & Explainable AI • ULB Benchmark (284,807 transactions)
              </p>
            </div>
          </div>

          {/* Quick Dataset Meta */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500">Dataset:</span>{' '}
              <span className="font-semibold text-slate-200">284,807</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div>
              <span className="text-slate-500">Fraud:</span>{' '}
              <span className="font-semibold text-rose-400">492 (0.172%)</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div>
              <span className="text-slate-500">XGBoost PR-AUC:</span>{' '}
              <span className="font-semibold text-emerald-400">0.884</span>
            </div>
          </div>

          {/* Download Project ZIP CTA */}
          <button
            onClick={() => downloadFullProjectZip()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project (.ZIP)</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
