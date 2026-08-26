/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CropAnalysisForm } from './components/CropAnalysisForm';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryView } from './components/HistoryView';
import { HowItWorks } from './components/HowItWorks';
import { TestingSuite } from './components/TestingSuite';
import { SafetyNoticeModal } from './components/SafetyNoticeModal';
import { CropAnalysisInput, CropAnalysisResult, HistoryRecord } from './types';
import { requestCropAnalysis } from './services/api';
import { getHistory, saveHistoryRecord, deleteHistoryRecord, clearAllHistory } from './utils/validation';
import { DEMO_SAMPLES } from './data/demoSamples';
import { AlertCircle, Sprout } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'how-it-works' | 'test-suite'>('analyze');
  const [currentInput, setCurrentInput] = useState<Partial<CropAnalysisInput>>({
    image: '',
    cropName: '',
    symptoms: '',
    duration: '',
    weather: '',
    irrigation: '',
    additionalNotes: '',
  });
  const [currentResult, setCurrentResult] = useState<CropAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isCurrentSaved, setIsCurrentSaved] = useState<boolean>(false);

  // Load history on initial mount
  useEffect(() => {
    setHistoryRecords(getHistory());
  }, []);

  const handleStartAnalysis = () => {
    setActiveTab('analyze');
    setCurrentResult(null);
    setErrorMessage(null);
    const formEl = document.getElementById('crop-analysis-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPreset = (input: CropAnalysisInput) => {
    setCurrentInput(input);
    setCurrentResult(null);
    setErrorMessage(null);
    setActiveTab('analyze');
    // Scroll to form smoothly
    setTimeout(() => {
      const formEl = document.getElementById('crop-analysis-form-container');
      formEl?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleAnalyze = async (input: CropAnalysisInput) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentInput(input);

    try {
      const result = await requestCropAnalysis(input);
      setCurrentResult(result);
      // Automatically save to local history
      saveHistoryRecord(input, result);
      setHistoryRecords(getHistory());
      setIsCurrentSaved(true);

      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        err.message || 'An error occurred while evaluating the crop specimen. Please verify your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryRecord = (record: HistoryRecord) => {
    setCurrentInput(record.input);
    setCurrentResult(record.result);
    setIsCurrentSaved(true);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistoryRecord(id);
    setHistoryRecords(getHistory());
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistoryRecords([]);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Primary Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setErrorMessage(null);
        }}
        historyCount={historyRecords.length}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Tab 1: Analyze Flow */}
        {activeTab === 'analyze' && (
          <div>
            {!currentResult && (
              <Hero
                onStartAnalysis={handleStartAnalysis}
                onSelectPreset={handleSelectPreset}
              />
            )}

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="max-w-4xl mx-auto mt-6 px-4 sm:px-6">
                <div
                  className="bg-red-50 border border-red-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-red-900 shadow-xs"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs sm:text-sm">
                    <h3 className="font-bold">Evaluation Incomplete</h3>
                    <p className="mt-1 leading-relaxed">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-xs font-bold text-red-700 hover:text-red-900 px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* If result is ready, display Dashboard; otherwise display Form */}
            {currentResult && currentInput.image ? (
              <AnalysisResults
                input={currentInput as CropAnalysisInput}
                result={currentResult}
                onReset={() => {
                  setCurrentResult(null);
                  setErrorMessage(null);
                }}
                onRefine={() => {
                  setCurrentResult(null);
                  setTimeout(() => {
                    const formEl = document.getElementById('crop-analysis-form-container');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                isSaved={isCurrentSaved}
                onSaveToHistory={() => {
                  saveHistoryRecord(currentInput as CropAnalysisInput, currentResult);
                  setHistoryRecords(getHistory());
                  setIsCurrentSaved(true);
                }}
              />
            ) : (
              <CropAnalysisForm
                initialInput={currentInput}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
              />
            )}
          </div>
        )}

        {/* Tab 2: History Manager */}
        {activeTab === 'history' && (
          <HistoryView
            records={historyRecords}
            onSelectRecord={handleSelectHistoryRecord}
            onDeleteRecord={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
            onNewAnalysis={() => {
              setCurrentResult(null);
              setActiveTab('analyze');
            }}
          />
        )}

        {/* Tab 3: How It Works & Decision Support Guide */}
        {activeTab === 'how-it-works' && (
          <HowItWorks
            onAnalyzeCTA={() => {
              setActiveTab('analyze');
              setCurrentResult(null);
            }}
          />
        )}

        {/* Tab 4: Built-in Automated Test Suite */}
        {activeTab === 'test-suite' && <TestingSuite />}
      </main>

      {/* Safety & Responsible AI Modal */}
      <SafetyNoticeModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 sm:py-10 border-t border-stone-800 text-xs mt-10 sm:mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">LeafLogic</span>
              <p className="text-[11px] text-stone-500">AI Crop Health Decision Support System</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-stone-400 text-xs">
              Powered by Google Gemini 3.7 Flash • Multimodal Diagnostic Assistance
            </p>
            <p className="text-[11px] text-stone-500">
              Not a substitute for certified agronomists or professional laboratory diagnostics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
