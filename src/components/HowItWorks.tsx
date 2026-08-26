/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  Eye,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksProps {
  onAnalyzeCTA: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onAnalyzeCTA }) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-3 sm:px-6 space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Agricultural Decision Support Paradigm</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          How LeafLogic Works
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          LeafLogic is designed from the ground up as a clinical-grade decision support assistant—not an autonomous diagnosis system. It bridges multimodal AI vision with agronomic context to protect crops while preventing costly misapplication of agricultural inputs.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Pillar 1: Multimodal Fusion */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">1. Multimodal Evidence Fusion</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Diagnosing crop health from an image alone is prone to error because fungal, bacterial, and nutrient stresses often look identical on foliage. LeafLogic pairs high-resolution image analysis with crucial farm context: symptom duration, rainfall, and irrigation methods.
          </p>
        </div>

        {/* Pillar 2: The Confidence Gate */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">2. The Confidence Gate (Core Innovation)</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            When an image is blurry, poorly lit, or contextual information is missing, LeafLogic <strong>does not guess</strong>. Instead, the Confidence Gate halts premature conclusions and tells the farmer exactly what evidence is needed to reach a reliable assessment.
          </p>
        </div>

        {/* Pillar 3: Explainable Reasoning */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">3. Observable Evidence vs. Inferences</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Every assessment clearly separates <em>visual facts</em> (e.g., &quot;concentric dark rings with yellow chlorotic margins&quot;) from <em>interpretations</em> and provides differential alternative conditions with assigned likelihoods.
          </p>
        </div>

        {/* Pillar 4: Non-Hazardous Action Plan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">4. Safe Cultural Recommendations</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            LeafLogic strictly avoids dangerous chemical recipes or off-label pesticide dosages. Recommendations focus on physical cultural practices: sanitizing tools, modifying irrigation, canopy pruning, mulching, and contacting local extension agents.
          </p>
        </div>
      </div>

      {/* Safety & Responsible AI Box */}
      <div className="bg-stone-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
            !
          </div>
          <h3 className="text-base sm:text-xl font-bold">Responsible AI & Diagnostic Safety Boundaries</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-xs sm:text-sm text-stone-300">
          <div>
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>What LeafLogic Does</span>
            </h4>
            <ul className="space-y-1 text-stone-300 leading-relaxed">
              <li>• Evaluates crop symptoms with multimodal AI</li>
              <li>• Highlights missing information & blurry photos</li>
              <li>• Recommends safe non-chemical cultural steps</li>
              <li>• Escalates uncertain cases to extension officers</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>What LeafLogic NEVER Does</span>
            </h4>
            <ul className="space-y-1 text-stone-300 leading-relaxed">
              <li>• Claim 100% autonomous diagnostic certainty</li>
              <li>• Prescribe hazardous chemical mixtures</li>
              <li>• Provide precise toxic pesticide dosages</li>
              <li>• Guess when evidence is inadequate</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privacy Guarantee</span>
            </h4>
            <ul className="space-y-1 text-stone-300 leading-relaxed">
              <li>• No user account required</li>
              <li>• No permanent server image storage</li>
              <li>• Analysis history stored in local browser only</li>
              <li>• API keys secured server-side</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-center">
          <button
            type="button"
            onClick={onAnalyzeCTA}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition min-h-[44px] cursor-pointer"
          >
            <span>Try LeafLogic Decision Support Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
