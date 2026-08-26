/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { ConfidenceGateEvaluation } from '../types';

interface ConfidenceGateBadgeProps {
  evaluation: ConfidenceGateEvaluation;
  onRefineRequest?: () => void;
}

export const ConfidenceGateBadge: React.FC<ConfidenceGateBadgeProps> = ({
  evaluation,
  onRefineRequest,
}) => {
  const { status, headline, summary, missingItems, severity } = evaluation;

  if (status === 'actionable') {
    return (
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-emerald-50 border border-emerald-300 shadow-2xs">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                Confidence Gate: Passed
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-700 font-medium">Sufficient Evidence & Clarity</span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-emerald-950 mt-1">{headline}</h3>
            <p className="text-xs sm:text-sm text-emerald-900/90 mt-1 leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>
    );
  }

  const isWarning = severity === 'warning' || status === 'needs_more_info';

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border shadow-2xs ${
        isWarning
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-red-50/90 border-red-300 text-red-950'
      }`}
      role="alert"
    >
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isWarning ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {isWarning ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" /> : <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-md ${
                isWarning
                  ? 'bg-amber-200 text-amber-900 border border-amber-300'
                  : 'bg-red-200 text-red-900 border border-red-300'
              }`}
            >
              Confidence Gate: {status === 'needs_more_info' ? 'Information Gap' : 'Low Confidence'}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-stone-600">Strict Safety Verification</span>
          </div>

          <h3 className="text-sm sm:text-base md:text-lg font-extrabold mt-1.5">{headline}</h3>
          <p className="text-xs sm:text-sm mt-1 leading-relaxed">{summary}</p>

          {/* Missing items checklist */}
          {missingItems && missingItems.length > 0 && (
            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-amber-200/80">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Specific details requested by LeafLogic:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {missingItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/80 rounded-xl p-2.5 border border-amber-200/50">
                    <span className="text-amber-700 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onRefineRequest && (
            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={onRefineRequest}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition min-h-[40px] cursor-pointer"
              >
                <span>Refine Information / Retake Photo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
