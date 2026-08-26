/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropAnalysisInput, CropAnalysisResult, ConfidenceGateEvaluation, HistoryRecord } from '../types';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file provided.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP crop image.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum supported file size is 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Resizes and compresses an image in browser memory before sending over the network.
 * Keeps aspect ratio within maxWidth/maxHeight.
 */
export async function optimizeImageForAnalysis(
  fileOrDataUrl: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }

      // Fill white background for transparent PNGs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve({ dataUrl, mimeType });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for processing'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Validates the user input form before sending to analysis
 */
export function validateAnalysisInput(input: Partial<CropAnalysisInput>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.image || input.image.trim() === '') {
    errors.image = 'A clear crop/leaf image is required for analysis.';
  }

  if (!input.cropName || input.cropName.trim().length < 2) {
    errors.cropName = 'Please specify the crop name or type (e.g., Tomato, Corn, Wheat).';
  } else if (input.cropName.length > 80) {
    errors.cropName = 'Crop name cannot exceed 80 characters.';
  }

  if (!input.symptoms || input.symptoms.trim().length < 5) {
    errors.symptoms = 'Please describe the symptoms observed on leaves, stems, or fruit (at least 5 characters).';
  } else if (input.symptoms.length > 800) {
    errors.symptoms = 'Symptoms description cannot exceed 800 characters.';
  }

  if (!input.duration || input.duration.trim().length < 2) {
    errors.duration = 'Please indicate how long symptoms have been visible (e.g., 3 days, 2 weeks).';
  }

  if (!input.weather || input.weather.trim().length < 2) {
    errors.weather = 'Please provide recent rainfall or weather conditions (e.g., Heavy rain, dry hot).';
  }

  if (!input.irrigation || input.irrigation.trim().length < 2) {
    errors.irrigation = 'Please specify irrigation method (e.g., Drip, sprinkler, rainfed).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates the AI response JSON object strictly against the expected schema
 */
export function validateAIResponseSchema(data: unknown): { valid: boolean; result?: CropAnalysisResult; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'AI response is not a valid JSON object.' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.crop_identified !== 'string') {
    return { valid: false, error: 'Missing or invalid field: crop_identified.' };
  }

  const validImageQualities = ['sufficient', 'poor_focus', 'blurry', 'too_far', 'insufficient_detail', 'unclear'];
  if (typeof obj.image_quality !== 'string' || !validImageQualities.includes(obj.image_quality)) {
    obj.image_quality = 'sufficient';
  }

  const validStatuses = ['actionable', 'needs_more_info', 'low_confidence', 'inconclusive'];
  if (typeof obj.assessment_status !== 'string' || !validStatuses.includes(obj.assessment_status)) {
    obj.assessment_status = 'needs_more_info';
  }

  let confidenceScore = typeof obj.confidence_score === 'number' ? obj.confidence_score : 50;
  if (confidenceScore <= 1 && confidenceScore > 0) {
    // If returned as decimal (0-1), normalize to 0-100
    confidenceScore = Math.round(confidenceScore * 100);
  }
  confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));

  const validRiskLevels = ['Low', 'Moderate', 'High', 'Critical', 'Unknown'];
  let riskLevel = typeof obj.risk_level === 'string' ? obj.risk_level : 'Unknown';
  if (!validRiskLevels.includes(riskLevel)) {
    riskLevel = 'Unknown';
  }

  const likelyIssues = Array.isArray(obj.likely_issues)
    ? obj.likely_issues.map((issue: any) => ({
        name: typeof issue?.name === 'string' ? issue.name : 'Unspecified condition',
        confidence: typeof issue?.confidence === 'number' ? (issue.confidence <= 1 ? Math.round(issue.confidence * 100) : issue.confidence) : 50,
        supporting_observations: Array.isArray(issue?.supporting_observations)
          ? issue.supporting_observations.filter((o: any) => typeof o === 'string')
          : [],
      }))
    : [];

  const alternativePossibilities = Array.isArray(obj.alternative_possibilities)
    ? obj.alternative_possibilities.map((alt: any) => ({
        name: typeof alt?.name === 'string' ? alt.name : 'Alternative condition',
        reason: typeof alt?.reason === 'string' ? alt.reason : 'Similar visual symptom pattern.',
        likelihood: (['Low', 'Moderate', 'High', 'Possible'].includes(alt?.likelihood) ? alt.likelihood : 'Possible') as any,
      }))
    : [];

  const observedEvidence = Array.isArray(obj.observed_evidence)
    ? obj.observed_evidence.filter((item: any) => typeof item === 'string')
    : [];

  const missingInformation = Array.isArray(obj.missing_information)
    ? obj.missing_information.filter((item: any) => typeof item === 'string')
    : [];

  const safeNextSteps = Array.isArray(obj.safe_next_steps)
    ? obj.safe_next_steps.filter((item: any) => typeof item === 'string')
    : [];

  const expertVerificationRequired = Boolean(obj.expert_verification_required);
  const explanation = typeof obj.explanation === 'string' ? obj.explanation : 'Assessment generated by LeafLogic.';

  const validatedResult: CropAnalysisResult = {
    crop_identified: obj.crop_identified,
    image_quality: obj.image_quality as any,
    assessment_status: obj.assessment_status as any,
    confidence_score: confidenceScore,
    risk_level: riskLevel as any,
    likely_issues: likelyIssues,
    alternative_possibilities: alternativePossibilities,
    observed_evidence: observedEvidence,
    missing_information: missingInformation,
    safe_next_steps: safeNextSteps,
    expert_verification_required: expertVerificationRequired,
    explanation,
  };

  return { valid: true, result: validatedResult };
}

/**
 * Evaluates the Confidence Gate based on model output and environmental context.
 * Enforces the core innovation: Never guess when evidence is insufficient.
 */
export function evaluateConfidenceGate(result: CropAnalysisResult): ConfidenceGateEvaluation {
  const isImagePoor = result.image_quality !== 'sufficient';
  const isLowConfidence = result.confidence_score < 60;
  const isNeedsMoreInfo = result.assessment_status === 'needs_more_info' || isImagePoor;
  const hasMissingInfo = result.missing_information.length > 0;

  if (isImagePoor) {
    return {
      passed: false,
      status: 'needs_more_info',
      headline: 'LeafLogic needs a clearer image before making a reliable assessment.',
      summary: 'The uploaded image lacks sufficient optical clarity, focus, or resolution for dependable agricultural evaluation.',
      missingItems: [
        'Macro/close-up photo with clear focus on symptomatic leaf or stem areas',
        'Natural, even lighting without excessive glare or dark shadows',
        'Image showing both the top and underside of affected foliage',
        ...result.missing_information,
      ],
      recommendations: [
        'Take a new photo in good daylight, holding the camera steady 15–30 cm from the leaf.',
        'Ensure the focal point is sharp on the spots, lesions, or discolorations.',
        'Provide an additional angle showing healthy foliage adjacent to affected parts.',
      ],
      severity: 'warning',
    };
  }

  if (result.assessment_status === 'needs_more_info' || (result.confidence_score < 45 && hasMissingInfo)) {
    return {
      passed: false,
      status: 'needs_more_info',
      headline: 'LeafLogic needs more information before making a reliable assessment.',
      summary: 'While visual symptoms are visible, key agronomic context or physical details are needed to distinguish overlapping plant stresses.',
      missingItems: result.missing_information.length > 0 ? result.missing_information : [
        'Duration and progression pattern of symptoms across the plot',
        'Specific irrigation schedule and recent soil moisture readings',
        'Visual examination of leaf undersides for pest eggs, webbing, or fungal fruiting bodies',
      ],
      recommendations: [
        'Review the requested missing context points below.',
        'Re-submit with more detailed environmental history.',
        'Do not apply broad-spectrum chemicals until symptoms are verified.',
      ],
      severity: 'amber',
    };
  }

  if (isLowConfidence || result.assessment_status === 'low_confidence') {
    return {
      passed: true, // Display with explicit prominent low-confidence warning
      status: 'low_confidence',
      headline: 'Low confidence — agricultural expert verification recommended.',
      summary: 'The observable signs match multiple possible biotic or abiotic conditions. Autonomous treatment without field verification carries high crop risk.',
      missingItems: result.missing_information,
      recommendations: [
        'Consult your local agricultural extension service or certified agronomist.',
        'Isolate symptomatic samples in a clean container for professional laboratory testing.',
        'Check nearby plants in the same row to map disease distribution.',
      ],
      severity: 'amber',
    };
  }

  return {
    passed: true,
    status: 'actionable',
    headline: 'Assessment Ready — Decision Support Analysis',
    summary: 'Observed patterns and provided context align with documented crop health conditions. Follow safe non-hazardous cultural steps.',
    missingItems: result.missing_information,
    recommendations: result.safe_next_steps,
    severity: 'success',
  };
}

// Local Storage History Management
const HISTORY_STORAGE_KEY = 'leaflogic_analysis_history_v1';

export function getHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveHistoryRecord(input: CropAnalysisInput, result: CropAnalysisResult): HistoryRecord {
  const record: HistoryRecord = {
    id: `ll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    input,
    result,
    cropName: result.crop_identified || input.cropName,
    riskLevel: result.risk_level,
    confidenceScore: result.confidence_score,
    status: result.assessment_status,
  };

  try {
    const current = getHistory();
    // Keep max 50 recent records in local storage
    const updated = [record, ...current.slice(0, 49)];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save to localStorage (quota or disabled)', e);
  }

  return record;
}

export function deleteHistoryRecord(id: string): boolean {
  try {
    const current = getHistory();
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete history record', e);
    return false;
  }
}

export function clearAllHistory(): boolean {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear history', e);
    return false;
  }
}
