/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ImageQualityStatus =
  | 'sufficient'
  | 'poor_focus'
  | 'blurry'
  | 'too_far'
  | 'insufficient_detail'
  | 'unclear';

export type AssessmentStatus =
  | 'actionable'
  | 'needs_more_info'
  | 'low_confidence'
  | 'inconclusive';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical' | 'Unknown';

export type Language = 'en' | 'te' | 'hi';

export interface LikelyIssue {
  name: string;
  confidence: number; // 0 to 100
  supporting_observations: string[];
}

export interface AlternativePossibility {
  name: string;
  reason: string;
  likelihood: 'Low' | 'Moderate' | 'High' | 'Possible';
}

export interface CropAnalysisResult {
  crop_identified: string;
  image_quality: ImageQualityStatus;
  assessment_status: AssessmentStatus;
  confidence_score: number; // 0 to 100
  risk_level: RiskLevel;
  likely_issues: LikelyIssue[];
  alternative_possibilities: AlternativePossibility[];
  observed_evidence: string[];
  missing_information: string[];
  safe_next_steps: string[];
  expert_verification_required: boolean;
  explanation: string;
}

export interface CropAnalysisInput {
  image: string; // base64 Data URL or sample identifier
  cropName: string;
  symptoms: string;
  duration: string;
  weather: string;
  irrigation: string;
  language?: Language;
  additionalNotes?: string;
  imageMimeType?: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  input: CropAnalysisInput;
  result: CropAnalysisResult;
  cropName: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  status: AssessmentStatus;
}

export interface ConfidenceGateEvaluation {
  passed: boolean;
  status: AssessmentStatus;
  headline: string;
  summary: string;
  missingItems: string[];
  recommendations: string[];
  severity: 'success' | 'warning' | 'amber' | 'danger';
}

export interface TestCase {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  category: 'validation' | 'confidence_gate' | 'gemini_response' | 'storage' | 'accessibility';
}
