/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock, HeartHandshake } from 'lucide-react';

interface SafetyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyNoticeModal: React.FC<SafetyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-500 text-stone-950 px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950 shrink-0" />
            <h2 id="safety-modal-title" className="text-base sm:text-lg font-bold">
              Responsible AI & Agricultural Safety Notice
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-600/30 transition text-stone-950 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overflow-y-auto text-stone-800 text-xs sm:text-sm leading-relaxed">
          {/* Key Principle */}
          <div className="bg-amber-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-amber-200 text-amber-950">
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Decision Support, Not Autonomous Diagnosis</span>
            </h3>
            <p>
              LeafLogic is an educational and clinical decision-support tool. It assists farmers and agricultural workers in formulating hypotheses from visual symptoms and environmental context. It is <strong>not</strong> a certified replacement for professional agronomic inspection, laboratory tissue tests, or local extension advice.
            </p>
          </div>

          {/* Chemical & Pesticide Safeguards */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 text-xs sm:text-sm">Strict Pesticide & Chemical Safety Safeguards:</h3>
            <ul className="space-y-2 text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>No Dangerous Chemical Mixtures:</strong> LeafLogic strictly forbids generating unverified home chemical recipes, tank mixes, or off-label pesticide dosages.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Cultural-First Recommendations:</strong> Safe cultural methods (drip irrigation, sanitized pruning shears, mulching, air circulation, crop rotation) are prioritized to manage crop stress sustainably.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Expert Escalation:</strong> High-risk conditions (such as bacterial canker, quarantine rusts, or severe blights) explicitly require verification by certified agronomists before financial commitments are made.
                </span>
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div className="pt-3 border-t border-stone-200">
            <h3 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Privacy & Storage Model:</span>
            </h3>
            <p className="text-stone-600">
              LeafLogic processes crop images on demand via Google Gemini. No personal user accounts or identity information are collected. Your analysis history remains strictly in your own browser's local storage and can be deleted at any time with a single click.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs sm:text-sm hover:bg-emerald-800 transition min-h-[44px] cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
