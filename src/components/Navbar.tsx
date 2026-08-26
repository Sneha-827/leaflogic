/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sprout, History, HelpCircle, ShieldCheck, PlayCircle, Beaker } from 'lucide-react';

interface NavbarProps {
  activeTab: 'analyze' | 'history' | 'how-it-works' | 'test-suite';
  onSelectTab: (tab: 'analyze' | 'history' | 'how-it-works' | 'test-suite') => void;
  historyCount: number;
  onOpenSafetyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  historyCount,
  onOpenSafetyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onSelectTab('analyze')}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl p-1 transition shrink-0 min-h-[44px]"
            aria-label="LeafLogic Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900">LeafLogic</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Decision Support
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 hidden md:block">AI Agricultural Health Assistant</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 no-scrollbar" aria-label="Main Navigation">
            <button
              id="nav-analyze-btn"
              onClick={() => onSelectTab('analyze')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[40px] shrink-0 cursor-pointer ${
                activeTab === 'analyze'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'
              }`}
              aria-current={activeTab === 'analyze' ? 'page' : undefined}
            >
              <Sprout className="w-4 h-4 shrink-0" />
              <span>Analyze</span>
            </button>

            <button
              id="nav-history-btn"
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition relative min-h-[40px] shrink-0 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'
              }`}
              aria-current={activeTab === 'history' ? 'page' : undefined}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>History</span>
              {historyCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full font-bold ${
                    activeTab === 'history' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>

            <button
              id="nav-how-it-works-btn"
              onClick={() => onSelectTab('how-it-works')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[40px] shrink-0 cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'
              }`}
              aria-current={activeTab === 'how-it-works' ? 'page' : undefined}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">How It Works</span>
              <span className="md:hidden">Guide</span>
            </button>

            <button
              id="nav-test-suite-btn"
              onClick={() => onSelectTab('test-suite')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[40px] shrink-0 cursor-pointer ${
                activeTab === 'test-suite'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200'
              }`}
              aria-current={activeTab === 'test-suite' ? 'page' : undefined}
              title="Built-in automated test suite"
            >
              <Beaker className="w-4 h-4 shrink-0 text-emerald-600 group-hover:text-emerald-700" />
              <span className="hidden lg:inline">Test Suite</span>
            </button>

            {/* Safety & Responsible AI Badge Modal Trigger */}
            <button
              id="nav-safety-btn"
              onClick={onOpenSafetyModal}
              className="ml-1 sm:ml-2 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[40px] shrink-0 cursor-pointer"
              title="View Responsible AI & Agricultural Safety Guidelines"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="hidden sm:inline">Safety</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
