/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropAnalysisInput, CropAnalysisResult } from '../types';
import { TOMATO_EARLY_BLIGHT_IMAGE_DATA_URL } from './tomatoEarlyBlightImage';
import { CUCUMBER_POWDERY_MILDEW_IMAGE_DATA_URL } from './cucumberPowderyMildewImage';
import { BLURRED_BUSH_LEAVES_IMAGE_DATA_URL } from './blurredBushLeavesImage';
import { APPLE_CEDAR_RUST_IMAGE_DATA_URL } from './appleCedarRustImage';

export interface DemoSample {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  category: 'actionable' | 'confidence_gate_image' | 'confidence_gate_context' | 'expert_escalation';
  input: CropAnalysisInput;
  mockResult: CropAnalysisResult;
}

// Generate realistic SVG image Data URLs for offline/reliable visual samples
function createSvgDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '));
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

const CORN_NUTRIENT_DEFICIENCY_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cornGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#276749"/>
      <stop offset="35%" stop-color="#d69e2e"/>
      <stop offset="50%" stop-color="#ecc94b"/>
      <stop offset="65%" stop-color="#d69e2e"/>
      <stop offset="100%" stop-color="#276749"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="#1a202c"/>
  <!-- Corn elongated blade -->
  <path d="M 280 550 Q 300 280 300 60 Q 320 280 340 550 Z" fill="url(#cornGrad)" stroke="#1c4532" stroke-width="3"/>
  <!-- V-shaped yellowing chlorosis down the midrib (typical Nitrogen deficiency vs drought stress) -->
  <path d="M 300 80 L 315 280 L 325 500 L 275 500 L 285 280 Z" fill="#f6e05e" opacity="0.8"/>
  <path d="M 300 60 L 300 550" stroke="#fefcbf" stroke-width="3" opacity="0.9"/>
  <!-- Tip necrosis / browning -->
  <path d="M 292 60 Q 300 130 308 60 Z" fill="#744210"/>
  <text x="30" y="565" fill="#e2e8f0" font-family="sans-serif" font-size="15" font-weight="bold">SAMPLE #3: Maize / Corn V-Shaped Midrib Chlorosis</text>
</svg>
`);

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'sample-early-blight',
    title: 'Tomato Early Blight (Actionable)',
    subtitle: 'Clear concentric rings & chlorotic halos with damp weather history',
    badgeText: 'Actionable Case',
    category: 'actionable',
    input: {
      image: TOMATO_EARLY_BLIGHT_IMAGE_DATA_URL,
      cropName: 'Tomato (Solanum lycopersicum)',
      symptoms: 'Brown circular spots with distinct target-like concentric rings on lower mature leaves, surrounded by yellow halos. Starting to spread upwards.',
      duration: '4 days',
      weather: 'Warm (27°C) with persistent afternoon thunderstorms and high humidity (85%) over the past week.',
      irrigation: 'Overhead sprinkler irrigation every morning.',
      additionalNotes: 'Field planted 6 weeks ago; lower canopy foliage is quite dense.',
    },
    mockResult: {
      crop_identified: 'Tomato (Solanum lycopersicum)',
      image_quality: 'sufficient',
      assessment_status: 'actionable',
      confidence_score: 88,
      risk_level: 'Moderate',
      likely_issues: [
        {
          name: 'Early Blight (Alternaria solani)',
          confidence: 88,
          supporting_observations: [
            'Concentric target-like dark brown rings on leaf blade',
            'Chlorotic (yellow) halos framing the necrotic lesion boundaries',
            'Symptom emergence predominantly on mature lower foliage following prolonged leaf wetness',
          ],
        },
      ],
      alternative_possibilities: [
        {
          name: 'Septoria Leaf Spot (Septoria lycopersici)',
          reason: 'Causes numerous small circular spots, but usually lacks the pronounced concentric target rings and features distinct dark borders with grey centers.',
          likelihood: 'Low',
        },
        {
          name: 'Bacterial Spot (Xanthomonas spp.)',
          reason: 'Presents smaller water-soaked lesions that turn angular and scab-like rather than expanding concentric circles.',
          likelihood: 'Low',
        },
      ],
      observed_evidence: [
        'Distinct dark brown circular lesions (10–15mm diameter) with bullseye concentric banding',
        'Pronounced chlorosis surrounding lesion perimeters',
        'Leaf tissue turgidity remains intact outside lesion borders',
      ],
      missing_information: [
        'Close-up inspection of stem collars for dark sunken collar-rot lesions',
        'Observation of fruit calyx and shoulder surfaces for dark velvety sunken spots',
      ],
      safe_next_steps: [
        'Switch from overhead sprinkler to ground-level drip or soaker hose irrigation to keep leaves dry.',
        'Carefully prune lower diseased foliage (using sanitized shears) and dispose away from the field.',
        'Apply organic mulch (straw or clean compost) around plant bases to prevent soil splashback onto foliage.',
        'Ensure generous 45–60 cm plant spacing to improve air circulation across the canopy.',
      ],
      expert_verification_required: false,
      explanation:
        'The combination of concentric target-like necrotic rings, yellow chlorotic margins, and overhead irrigation during warm humid weather provides strong physical and environmental evidence consistent with Alternaria solani (Early Blight). Non-chemical cultural interventions should be implemented promptly.',
    },
  },
  {
    id: 'sample-powdery-mildew',
    title: 'Cucumber Powdery Mildew (Moderate)',
    subtitle: 'White fungal patches across upper leaf surfaces in greenhouse/tunnel',
    badgeText: 'Moderate Confidence',
    category: 'actionable',
    input: {
      image: CUCUMBER_POWDERY_MILDEW_IMAGE_DATA_URL,
      cropName: 'Cucumber (Cucumis sativus)',
      symptoms: 'Circular powdery white talcum-powder-like patches appearing on upper surfaces of leaves. Leaves feeling brittle.',
      duration: '5 days',
      weather: 'Dry, shaded conditions with warm days (26°C) and cool damp nights (15°C).',
      irrigation: 'Drip irrigation under black plastic mulch.',
      additionalNotes: 'Crops are in a high-tunnel polyhouse with limited passive ventilation.',
    },
    mockResult: {
      crop_identified: 'Cucumber (Cucumis sativus)',
      image_quality: 'sufficient',
      assessment_status: 'actionable',
      confidence_score: 82,
      risk_level: 'Moderate',
      likely_issues: [
        {
          name: 'Powdery Mildew (Podosphaera xanthii / Golovinomyces cichoracearum)',
          confidence: 82,
          supporting_observations: [
            'Superficial white powdery fungal mycelial patches across leaf lamina',
            'Symptoms expanding on shaded, older foliage under dry day/humid night cycles',
          ],
        },
      ],
      alternative_possibilities: [
        {
          name: 'Downy Mildew (Pseudoperonospora cubensis)',
          reason: 'Downy mildew creates angular yellow lesions restricted by leaf veins on the upper surface with purple-gray down on the underside, unlike superficial white powder.',
          likelihood: 'Low',
        },
        {
          name: 'Foliar Fertilizer Residue / Hard Water Staining',
          reason: 'Mineral residue wipes off smoothly without causing underlying chlorosis or brittle tissue.',
          likelihood: 'Low',
        },
      ],
      observed_evidence: [
        'Multiple distinct white powdery circular fungal colonies on upper leaf lamina',
        'Underlying leaf tissue shows slight chlorosis beneath older colonies',
      ],
      missing_information: [
        'Inspection of leaf undersides and petioles to evaluate colony density',
        'Relative humidity logger data inside the polyhouse structure',
      ],
      safe_next_steps: [
        'Increase polyhouse ventilation and side-wall rollups to reduce stagnant nighttime humidity.',
        'Prune excessive foliage and remove heavily infected senescing leaves to open light penetration.',
        'Avoid excessive nitrogen fertilization, which produces dense tender foliage prone to mildew.',
        'Inspect neighboring cucurbit plants (squash, melons) for early spot formation.',
      ],
      expert_verification_required: false,
      explanation:
        'Visual examination clearly shows superficial white fungal mycelium colonies characteristic of powdery mildew. High-tunnel environments with dry days and damp nights strongly promote conidial dispersal. Cultural ventilation and canopy thinning are indicated.',
    },
  },
  {
    id: 'sample-blurry-gate',
    title: 'Blurry Leaf Photo (Confidence Gate Triggered)',
    subtitle: 'Demonstrates optical quality rejection: "Needs clearer image"',
    badgeText: 'Quality Gate Test',
    category: 'confidence_gate_image',
    input: {
      image: BLURRED_BUSH_LEAVES_IMAGE_DATA_URL,
      cropName: 'Citrus / Lemon',
      symptoms: 'Spots visible from a distance but leaf was shaking in wind when photographed.',
      duration: '1 week',
      weather: 'Sunny 30°C.',
      irrigation: 'Drip system once weekly.',
      additionalNotes: 'Photo taken while walking past tree.',
    },
    mockResult: {
      crop_identified: 'Citrus (Probable, but unverified due to optical blur)',
      image_quality: 'blurry',
      assessment_status: 'needs_more_info',
      confidence_score: 24,
      risk_level: 'Unknown',
      likely_issues: [],
      alternative_possibilities: [
        {
          name: 'Citrus Canker vs Citrus Black Spot vs Greasy Spot',
          reason: 'Cannot differentiate crateriform pustules from fungal spots without sharp edge resolution.',
          likelihood: 'Possible',
        },
      ],
      observed_evidence: [
        'Severe motion blur and lack of sharp focus on leaf veins and lesion margins',
        'Generalized greenish and brownish pixel groupings without microscopic margin definition',
      ],
      missing_information: [
        'In-focus macro photograph taken with camera held steady in good indirect daylight',
        'Clear view of lesion margins (checking for oily halos or raised corky margins)',
        'Photo of both leaf upper and lower surface',
        'Photo of fruit or twig lesions if present',
      ],
      safe_next_steps: [
        'Re-photograph the affected leaf in calm conditions with a steady hand or resting the phone against a solid branch.',
        'Do not apply any copper or chemical sprays until symptoms are clearly identified.',
        'Inspect leaf undersides with a hand lens (10x) for mites or scale insects.',
      ],
      expert_verification_required: true,
      explanation:
        'LeafLogic Confidence Gate triggered: Optical image resolution and focal sharpness are insufficient to distinguish between regulated bacterial canker and benign foliar fungal spotting. Autonomous diagnosis without clear evidence is prohibited.',
    },
  },
  {
    id: 'sample-context-gap',
    title: 'Corn Midrib Chlorosis (Low Confidence & Context Gap)',
    subtitle: 'Demonstrates agronomic context gap triggering Expert Escalation',
    badgeText: 'Low Confidence Gate',
    category: 'confidence_gate_context',
    input: {
      image: CORN_NUTRIENT_DEFICIENCY_SVG,
      cropName: 'Maize / Corn (Zea mays)',
      symptoms: 'V-shaped yellowing starting at leaf tips and running down the central midrib.',
      duration: 'Unsure, just noticed',
      weather: 'Variable',
      irrigation: 'Not monitored',
      additionalNotes: 'No soil test or fertilizer history available.',
    },
    mockResult: {
      crop_identified: 'Maize / Corn (Zea mays)',
      image_quality: 'sufficient',
      assessment_status: 'low_confidence',
      confidence_score: 48,
      risk_level: 'Moderate',
      likely_issues: [
        {
          name: 'Nitrogen (N) Deficiency',
          confidence: 52,
          supporting_observations: [
            'Characteristic inverted V-shaped chlorosis extending from leaf tip along the midrib',
            'Older foliage affected first as mobile nitrogen is translocated to newer growth',
          ],
        },
        {
          name: 'Drought Stress combined with Compaction',
          confidence: 44,
          supporting_observations: [
            'Tip firing and midrib yellowing can be triggered when root access to soil moisture is restricted',
          ],
        },
      ],
      alternative_possibilities: [
        {
          name: 'Sulfur (S) Deficiency',
          reason: 'Sulfur is immobile in the plant, typically causing uniform yellowing on young upper leaves rather than older lower leaf midribs.',
          likelihood: 'Low',
        },
        {
          name: 'Maize Chlorotic Mottle Virus (MCMV)',
          reason: 'Viral mosaic patterns show fine mottling across the leaf blade rather than clean inverted-V midrib yellowing.',
          likelihood: 'Low',
        },
      ],
      observed_evidence: [
        'V-shaped chlorotic (yellow) discoloration following the main central vascular midrib',
        'Necrotic (brown) firing at the distal leaf apex tip',
        'Interveinal outer margins remain green',
      ],
      missing_information: [
        'Fertilizer application history (date and amount of nitrogen/NPK applied at planting/sidedress)',
        'Soil type, pH, and recent rainfall/irrigation volume',
        'Field distribution: Is symptom widespread across rows or in low compaction areas?',
      ],
      safe_next_steps: [
        'Collect representative composite soil and tissue samples for laboratory nutrient testing.',
        'Check soil moisture depth with a soil probe 15–30 cm below surface.',
        'Consult your local university or regional agricultural extension agent before applying high-dose fertilizer.',
      ],
      expert_verification_required: true,
      explanation:
        'While visual pattern strongly resembles classic Nitrogen deficiency (inverted V-yellowing), lack of soil test data, irrigation history, and fertilizer records prevents definitive differentiation from drought-induced root uptake blockage. Expert verification and soil testing recommended.',
    },
  },
  {
    id: 'sample-apple-rust',
    title: 'Apple Cedar Rust (Expert Verification Needed)',
    subtitle: 'Bright orange-yellow lesions with potential regional biosecurity impact',
    badgeText: 'Expert Verification',
    category: 'expert_escalation',
    input: {
      image: APPLE_CEDAR_RUST_IMAGE_DATA_URL,
      cropName: 'Apple (Malus domestica)',
      symptoms: 'Bright yellow-orange circular spots and lesions on upper leaf surfaces, with raised centers and small dark specks (spermagonia).',
      duration: '8 days',
      weather: 'Cool, wet spring with frequent rainfall (16-18°C) and persistent morning leaf dampness.',
      irrigation: 'Under-canopy micro-sprinklers in orchard.',
      additionalNotes: 'Eastern red cedar (Juniperus virginiana) trees grow within 400 meters of the orchard fence line.',
    },
    mockResult: {
      crop_identified: 'Apple (Malus domestica)',
      image_quality: 'sufficient',
      assessment_status: 'actionable',
      confidence_score: 90,
      risk_level: 'High',
      likely_issues: [
        {
          name: 'Cedar-Apple Rust (Gymnosporangium juniperi-virginianae)',
          confidence: 90,
          supporting_observations: [
            'Bright yellow-orange circular lesions on upper leaf surface',
            'Presence of small dark specks (spermagonia) within lesion centers',
            'Proximity to Juniperus virginiana (alternate host)',
            'Cool, wet spring weather conditions favoring fungal basidiospore infection',
          ],
        },
      ],
      alternative_possibilities: [
        {
          name: 'Apple Scab (Venturia inaequalis)',
          reason: 'Causes olive-green to dark velvety circular spots that turn corky/black, lacking the vivid carotenoid orange coloration of cedar rust.',
          likelihood: 'Low',
        },
        {
          name: 'Frogeye Leaf Spot (Botryosphaeria obtusa)',
          reason: 'Lesions have purple margins with light tan/grey centers ("frog-eye"), not vibrant orange-yellow.',
          likelihood: 'Low',
        },
      ],
      observed_evidence: [
        'Vivid carotenoid yellow-orange spots (5–12mm) with distinct chlorotic rings',
        'Visible dark central specks (spermagonia) on upper surface lesions',
        'Leaf blade structure intact around lesion margins',
      ],
      missing_information: [
        'Observation of lower leaf surface for tube-like aecia structures (fringed cups)',
        'Inspection of cedar trees nearby for gelatinous orange galls/spore horns',
      ],
      safe_next_steps: [
        'Remove and destroy fallen leaves to reduce primary inoculum for next season.',
        'Prune out any visible galls on nearby Juniper trees before spring rains if accessible.',
        'Improve orchard airflow through proper canopy pruning to reduce leaf wetness duration.',
        'Avoid overhead irrigation to keep foliage dry.',
        'Consult a local agricultural extension officer or tree fruit pathologist for regional management thresholds.',
      ],
      expert_verification_required: true,
      explanation:
        'Vivid yellow-orange spotting with spermagonia specks on apple foliage in close proximity to cedar trees during a cool, wet spring is characteristic of the heteroecious rust fungus Gymnosporangium juniperi-virginianae. Verification by a qualified fruit pathologist and orchard canopy management is recommended.',
    },
  },
];
