/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sprout, ShieldAlert, Cpu, Eye, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { DEMO_SAMPLES } from '../data/demoSamples';
import { CropAnalysisInput } from '../types';

interface HeroProps {
  onStartAnalysis: () => void;
  onSelectPreset: (input: CropAnalysisInput) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartAnalysis, onSelectPreset }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-8 sm:pt-12 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 shadow-sm">
      {/* Background Decorative Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Responsible AI Pill */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-[11px] sm:text-xs md:text-sm font-medium mb-4 sm:mb-6 max-w-full">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
          <span className="truncate sm:whitespace-normal">Multimodal Decision Support • Powered by Google Gemini</span>
        </div>

        {/* Brand Headline & Tagline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 px-1 break-words">
          See the signs. Understand the risk.{' '}
          <span className="text-emerald-300 block sm:inline mt-1 sm:mt-0">Act smarter.</span>
        </h1>

        {/* Concept Description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-emerald-100/90 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
          LeafLogic combines crop photography with farm context—weather, irrigation, and symptom progression—to evaluate plant health issues. Built with a strict{' '}
          <strong className="text-white font-semibold underline decoration-emerald-400 decoration-2 underline-offset-4">
            Confidence Gate
          </strong>{' '}
          that communicates uncertainty and requests missing data rather than guessing.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-2">
          <button
            id="hero-analyze-cta"
            onClick={onStartAnalysis}
            className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 rounded-xl bg-emerald-400 text-emerald-950 font-bold text-base sm:text-lg shadow-lg hover:bg-emerald-300 hover:shadow-emerald-500/20 active:scale-98 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 cursor-pointer"
          >
            <Sprout className="w-5 h-5 text-emerald-950 shrink-0" />
            <span>Analyze Crop Health</span>
            <ArrowRight className="w-4 h-4 text-emerald-950 shrink-0" />
          </button>
        </div>

        {/* Preset Sample Scenarios Quick-Bar */}
        <div className="bg-emerald-950/70 border border-emerald-700/50 rounded-2xl p-3.5 sm:p-5 md:p-6 backdrop-blur-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 pb-3 border-b border-emerald-800/60">
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>⚡ Test Demo Scenarios (One-Click Load)</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-0.5">
                Explore real agronomic cases and see the Confidence Gate in action.
              </p>
            </div>
            <span className="text-[10px] sm:text-xs text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-700 font-medium self-start sm:self-auto">
              5 Presets Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                id={`hero-preset-${sample.id}`}
                onClick={() => onSelectPreset(sample.input)}
                className="group p-3 sm:p-3.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 hover:border-emerald-500/60 transition text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-200 group-hover:text-white truncate">
                    {sample.title}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      sample.category === 'confidence_gate_image'
                        ? 'bg-red-900/70 text-red-200 border border-red-700'
                        : sample.category === 'confidence_gate_context'
                        ? 'bg-amber-900/70 text-amber-200 border border-amber-700'
                        : sample.category === 'expert_escalation'
                        ? 'bg-purple-900/70 text-purple-200 border border-purple-700'
                        : 'bg-emerald-800 text-emerald-200 border border-emerald-600'
                    }`}
                  >
                    {sample.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 line-clamp-2 leading-relaxed">
                  {sample.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Micro-Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-800/40 text-left">
          <div className="flex items-start gap-2.5 p-1">
            <ShieldAlert className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Confidence Gate</h3>
              <p className="text-[11px] text-emerald-200/70">Rejects low-quality data instead of guessing</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-1">
            <Eye className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Observable Evidence</h3>
              <p className="text-[11px] text-emerald-200/70">Distinguishes visual facts from inferences</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Safe Cultural Steps</h3>
              <p className="text-[11px] text-emerald-200/70">Non-hazardous physical & moisture practices</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-1">
            <Cpu className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Zero Cloud Lock-in</h3>
              <p className="text-[11px] text-emerald-200/70">Browser-only local history & privacy-first</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
