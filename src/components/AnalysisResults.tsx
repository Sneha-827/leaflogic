/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sprout,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Share2,
  Printer,
  BookmarkCheck,
  Eye,
  ListOrdered,
  FileCheck2,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CropAnalysisInput, CropAnalysisResult, RiskLevel } from '../types';
import { evaluateConfidenceGate } from '../utils/validation';
import { ConfidenceGateBadge } from './ConfidenceGateBadge';

interface AnalysisResultsProps {
  input: CropAnalysisInput;
  result: CropAnalysisResult;
  onReset: () => void;
  onRefine: () => void;
  onSaveToHistory?: () => void;
  isSaved?: boolean;
}

const getRiskLevelBadge = (risk: RiskLevel) => {
  switch (risk) {
    case 'Critical':
      return {
        bg: 'bg-red-100 text-red-900 border-red-300',
        dot: 'bg-red-600',
        label: 'Critical Risk',
        description: 'Rapid spread potential or severe yield loss without intervention.',
      };
    case 'High':
      return {
        bg: 'bg-orange-100 text-orange-900 border-orange-300',
        dot: 'bg-orange-600',
        label: 'High Risk',
        description: 'Significant disease or stress requiring prompt cultural action.',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-600',
        label: 'Moderate Risk',
        description: 'Manageable foliar stress; monitor progression closely.',
      };
    case 'Low':
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dot: 'bg-emerald-600',
        label: 'Low Risk',
        description: 'Isolated symptoms; low immediate danger to crop harvest.',
      };
    default:
      return {
        bg: 'bg-stone-100 text-stone-900 border-stone-300',
        dot: 'bg-stone-500',
        label: 'Unknown Risk',
        description: 'Insufficient clarity to assess field severity.',
      };
  }
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  input,
  result,
  onReset,
  onRefine,
  onSaveToHistory,
  isSaved = false,
}) => {
  const [showInputContext, setShowInputContext] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const gateEval = evaluateConfidenceGate(result);
  const riskBadge = getRiskLevelBadge(result.risk_level);

  const handlePrint = () => {
    window.print();
  };

  const handleShareSummary = () => {
    const textSummary = `[LeafLogic Crop Assessment]
Crop: ${result.crop_identified}
Confidence: ${result.confidence_score}%
Risk Level: ${result.risk_level}
Assessment: ${result.explanation}
Safe Next Steps: ${result.safe_next_steps.slice(0, 3).join('; ')}
(Decision-support summary generated via LeafLogic)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textSummary);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-5 sm:py-8 px-3 sm:px-6 space-y-6 sm:space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 print:hidden bg-white/60 p-3 sm:p-4 rounded-2xl border">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700 hover:text-emerald-800 transition min-h-[40px] px-3 py-2 rounded-xl bg-stone-100 sm:bg-transparent hover:bg-stone-100 self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>New Analysis</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition min-h-[40px] cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <button
            onClick={handleShareSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 transition min-h-[40px] cursor-pointer"
            title="Copy structured summary to clipboard"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition min-h-[40px] cursor-pointer shadow-2xs"
            title="Print or save as PDF report"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Confidence Gate Prominent Banner */}
      <ConfidenceGateBadge evaluation={gateEval} onRefineRequest={gateEval.passed ? undefined : onRefine} />

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Image & Context Card */}
        <div className="lg:col-span-1 space-y-5 sm:space-y-6">
          {/* Image & Optical Quality Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
              <span>Analyzed Specimen</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  result.image_quality === 'sufficient'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                Quality: {result.image_quality}
              </span>
            </h3>

            {input.image ? (
              <div className="rounded-xl overflow-hidden bg-stone-900 aspect-4/3 flex items-center justify-center border border-stone-200">
                <img
                  src={input.image}
                  alt={`Specimen of ${result.crop_identified}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl bg-stone-100 aspect-4/3 flex items-center justify-center text-stone-400 text-xs">
                No image preview available
              </div>
            )}

            {/* Crop Identification Block */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium">Crop Evaluated</span>
              <h4 className="text-base sm:text-lg font-extrabold text-stone-900">{result.crop_identified}</h4>
            </div>

            {/* Toggle Environmental Context */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowInputContext(!showInputContext)}
                className="w-full flex items-center justify-between text-xs font-semibold text-stone-700 hover:text-emerald-800 transition min-h-[36px] cursor-pointer"
              >
                <span>Submitted Farm Context</span>
                {showInputContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInputContext && (
                <div className="mt-3 text-xs space-y-2 bg-stone-50 rounded-xl p-3 border border-stone-200 leading-relaxed">
                  <div>
                    <span className="font-semibold text-stone-700">Symptoms:</span>
                    <p className="text-stone-600 mt-0.5 break-words">{input.symptoms}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Duration:</span>
                    <span className="text-stone-600 ml-1">{input.duration}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Weather:</span>
                    <span className="text-stone-600 ml-1 break-words">{input.weather}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Irrigation:</span>
                    <span className="text-stone-600 ml-1 break-words">{input.irrigation}</span>
                  </div>
                  {input.additionalNotes && (
                    <div>
                      <span className="font-semibold text-stone-700">Notes:</span>
                      <span className="text-stone-600 ml-1 break-words">{input.additionalNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Metrics: Confidence & Risk Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-5">
            {/* Confidence Score Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <span>Confidence Level</span>
                  <HelpCircle className="w-3.5 h-3.5 text-stone-400" title="Model's conservative confidence estimate" />
                </span>
                <span className="text-sm font-extrabold text-stone-900">{result.confidence_score}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    result.confidence_score >= 75
                      ? 'bg-emerald-600'
                      : result.confidence_score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(5, result.confidence_score)}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                {result.confidence_score >= 75
                  ? 'Strong correlation with documented visual evidence.'
                  : result.confidence_score >= 50
                  ? 'Moderate certainty; potential overlap with other conditions.'
                  : 'Low certainty; expert laboratory testing advised.'}
              </p>
            </div>

            {/* Risk Level Badge */}
            <div className="pt-4 border-t border-stone-100">
              <span className="text-xs text-stone-500 font-medium block mb-1.5">Agronomic Risk Level</span>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${riskBadge.bg}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${riskBadge.dot} animate-pulse shrink-0`} />
                <span className="text-xs sm:text-sm font-bold">{riskBadge.label}</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{riskBadge.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Findings & Next Steps */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Section: Why LeafLogic Thinks This (Explainable AI) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Why LeafLogic Thinks This (Reasoning & Evidence)</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/80 p-3.5 sm:p-4 rounded-xl border border-stone-200">
              {result.explanation}
            </p>

            {/* Observed Visual Evidence Checklist */}
            {result.observed_evidence && result.observed_evidence.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Observed Visual Facts (Specimen Evidence):</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.observed_evidence.map((evidence, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 bg-emerald-50/60 text-emerald-950 p-2.5 rounded-xl border border-emerald-200/60"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section: Primary Candidate Conditions */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 mb-4">
              <Sprout className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Likely Crop Health Conditions</span>
            </h3>

            {result.likely_issues && result.likely_issues.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {result.likely_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-50/70 border border-stone-200 rounded-xl p-3.5 sm:p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h4 className="text-sm sm:text-base font-bold text-stone-900">{issue.name}</h4>
                      <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 self-start sm:self-auto">
                        Likelihood: {issue.confidence}%
                      </span>
                    </div>

                    {issue.supporting_observations && issue.supporting_observations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-stone-600 block">Supporting Observations:</span>
                        <ul className="list-disc list-inside text-xs text-stone-700 space-y-1 pl-1 leading-relaxed">
                          {issue.supporting_observations.map((obs, oIdx) => (
                            <li key={oIdx}>{obs}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs">
                No singular issue could be isolated due to insufficient image sharpness or missing agronomic details.
              </div>
            )}
          </div>

          {/* Section: Alternative Possibilities (Differential Diagnosis) */}
          {result.alternative_possibilities && result.alternative_possibilities.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-2xs space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 mb-2">
                <ListOrdered className="w-5 h-5 text-stone-600 shrink-0" />
                <span>Alternative Possibilities (Differential Assessment)</span>
              </h3>
              <p className="text-xs text-stone-600 mb-3">
                Other potential conditions considered by the decision support engine:
              </p>

              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden min-w-[460px]">
                  <thead className="bg-stone-100 text-stone-800 font-bold">
                    <tr>
                      <th className="p-2.5 sm:p-3">Condition</th>
                      <th className="p-2.5 sm:p-3">Differential Analysis</th>
                      <th className="p-2.5 sm:p-3">Likelihood</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {result.alternative_possibilities.map((alt, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="p-2.5 sm:p-3 font-semibold text-stone-900">{alt.name}</td>
                        <td className="p-2.5 sm:p-3 text-stone-600 leading-relaxed">{alt.reason}</td>
                        <td className="p-2.5 sm:p-3 font-medium">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              alt.likelihood === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {alt.likelihood}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Safe Next Steps (Actionable Non-Hazardous Recommendations) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Recommended Safe Next Steps</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Non-Hazardous Cultural Actions
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Implement these physical, sanitation, and moisture controls to mitigate stress safely:
            </p>

            <div className="space-y-2.5">
              {result.safe_next_steps && result.safe_next_steps.length > 0 ? (
                result.safe_next_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs sm:text-sm text-stone-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">No specific immediate steps available.</p>
              )}
            </div>
          </div>

          {/* Expert Verification Escalation Notice */}
          {(result.expert_verification_required || result.confidence_score < 65 || result.risk_level === 'High' || result.risk_level === 'Critical') && (
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold">Agricultural Professional Verification Advised</h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Because crop diseases can rapidly evolve and share visual symptoms with regulated pathogens or severe nutrient deficiencies, consult with your local government agricultural extension officer or university crop diagnostic clinic before applying costly treatments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
