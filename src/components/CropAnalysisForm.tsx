/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Camera,
  X,
  AlertCircle,
  Sparkles,
  CloudRain,
  Droplets,
  Calendar,
  Layers,
  FileText,
  CheckCircle,
  Languages,
} from 'lucide-react';
import { CropAnalysisInput, Language } from '../types';
import { validateImageFile, optimizeImageForAnalysis, validateAnalysisInput } from '../utils/validation';

interface CropAnalysisFormProps {
  initialInput?: Partial<CropAnalysisInput>;
  isAnalyzing: boolean;
  onAnalyze: (input: CropAnalysisInput) => void;
}

const COMMON_CROPS = [
  'Tomato',
  'Maize / Corn',
  'Cucumber',
  'Apple',
  'Potato',
  'Wheat',
  'Rice',
  'Chili / Pepper',
  'Soybean',
  'Citrus',
  'Grape',
  'Cotton',
];

const DURATION_PRESETS = ['1–3 days', '4–7 days', '1–2 weeks', 'Over 3 weeks'];

const WEATHER_PRESETS = [
  'Heavy rain & high humidity (85%)',
  'Warm (28°C) with dry sunny days',
  'Cool (16°C) with frequent drizzle',
  'Intense heatwave (>35°C)',
];

const IRRIGATION_PRESETS = [
  'Drip irrigation (soil level)',
  'Overhead sprinkler irrigation',
  'Rainfed (natural precipitation only)',
  'Flood / furrow irrigation',
];

export const CropAnalysisForm: React.FC<CropAnalysisFormProps> = ({
  initialInput,
  isAnalyzing,
  onAnalyze,
}) => {
  const [image, setImage] = useState<string>(initialInput?.image || '');
  const [cropName, setCropName] = useState<string>(initialInput?.cropName || '');
  const [symptoms, setSymptoms] = useState<string>(initialInput?.symptoms || '');
  const [duration, setDuration] = useState<string>(initialInput?.duration || '');
  const [weather, setWeather] = useState<string>(initialInput?.weather || '');
  const [irrigation, setIrrigation] = useState<string>(initialInput?.irrigation || '');
  const [language, setLanguage] = useState<Language>(initialInput?.language || 'en');
  const [additionalNotes, setAdditionalNotes] = useState<string>(initialInput?.additionalNotes || '');

  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Update fields if initialInput changes (e.g. from preset selection)
  React.useEffect(() => {
    if (initialInput) {
      if (initialInput.image !== undefined) {
        if (initialInput.image.startsWith('data:image/svg')) {
          optimizeImageForAnalysis(initialInput.image)
            .then(({ dataUrl }) => setImage(dataUrl))
            .catch(() => setImage(initialInput.image));
        } else {
          setImage(initialInput.image);
        }
      }
      if (initialInput.cropName !== undefined) setCropName(initialInput.cropName);
      if (initialInput.symptoms !== undefined) setSymptoms(initialInput.symptoms);
      if (initialInput.duration !== undefined) setDuration(initialInput.duration);
      if (initialInput.weather !== undefined) setWeather(initialInput.weather);
      if (initialInput.irrigation !== undefined) setIrrigation(initialInput.irrigation);
      if (initialInput.language !== undefined) setLanguage(initialInput.language);
      if (initialInput.additionalNotes !== undefined) setAdditionalNotes(initialInput.additionalNotes);
      setErrors({});
    }
  }, [initialInput]);

  const handleFileProcess = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, image: validation.error || 'Invalid file' }));
      return;
    }

    try {
      setIsCompressing(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });

      const { dataUrl } = await optimizeImageForAnalysis(file);
      setImage(dataUrl);
      setImageFileName(file.name);
      setImageFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Failed to process image.' }));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Camera Live Capture Support
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setIsCameraActive(false);
      setErrors((prev) => ({
        ...prev,
        image: 'Unable to access device camera. Please upload an image file instead.',
      }));
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImage(dataUrl);
      setImageFileName('camera-capture.jpg');
      setImageFileSize('Direct Capture');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleRemoveImage = () => {
    setImage('');
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImage = image;
    if (finalImage && finalImage.startsWith('data:image/svg')) {
      try {
        const { dataUrl } = await optimizeImageForAnalysis(finalImage);
        finalImage = dataUrl;
        setImage(dataUrl);
      } catch {
        // Continue with image
      }
    }

    const inputData: CropAnalysisInput = {
      image: finalImage,
      cropName: cropName.trim(),
      symptoms: symptoms.trim(),
      duration: duration.trim(),
      weather: weather.trim(),
      irrigation: irrigation.trim(),
      language,
      additionalNotes: additionalNotes.trim(),
    };

    const validation = validateAnalysisInput(inputData);
    if (!validation.valid) {
      setErrors(validation.errors);
      // Scroll to top of form to show errors
      const formEl = document.getElementById('crop-analysis-form');
      formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setErrors({});
    onAnalyze(inputData);
  };

  return (
    <div id="crop-analysis-form-container" className="w-full max-w-4xl mx-auto py-5 sm:py-8 px-3 sm:px-6">
      {/* Form Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-50/80 px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Crop Health Evaluation Form</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
              Upload a clear leaf or plant photograph and provide environmental background.
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
            Confidence Gated
          </span>
        </div>

        <form id="crop-analysis-form" onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8" noValidate>
          {/* Section 1: Image Upload & Drop Zone */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs sm:text-sm font-bold text-stone-900" htmlFor="image-upload-input">
                1. Crop / Leaf Photograph <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] sm:text-xs text-stone-500">Formats: JPEG, PNG, WebP (Max 10MB)</span>
            </div>

            {/* Camera Capture View */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600 bg-black aspect-4/3 w-full max-w-md mx-auto shadow-md">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10 px-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-400 active:scale-95 transition cursor-pointer"
                  >
                    📸 Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-800/80 text-white text-xs sm:text-sm hover:bg-stone-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : image ? (
              /* Image Preview Card */
              <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-2.5 sm:p-3 w-full max-w-md mx-auto">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-900">
                  <img
                    src={image}
                    alt="Uploaded crop leaf specimen"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    id="btn-remove-image"
                    onClick={handleRemoveImage}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    aria-label="Remove uploaded image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-stone-600 px-1 gap-2">
                  <span className="font-medium truncate max-w-[180px] sm:max-w-[220px]">
                    {imageFileName || 'Specimen image loaded'}
                  </span>
                  <span className="shrink-0 text-stone-500">{imageFileSize}</span>
                </div>
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
                    : errors.image
                    ? 'border-red-400 bg-red-50/30 hover:border-red-500'
                    : 'border-stone-300 bg-stone-50/50 hover:bg-stone-50 hover:border-emerald-600'
                }`}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Upload crop image by clicking or dragging and dropping"
              >
                <input
                  ref={fileInputRef}
                  id="image-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                <div className="text-xs sm:text-sm font-bold text-stone-800 mb-1">
                  {isCompressing ? 'Optimizing image...' : 'Click to select or drag & drop a crop photo'}
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 max-w-sm mx-auto mb-4 leading-relaxed">
                  For the highest accuracy, provide a clear, close-up photograph of the symptomatic leaf or plant area in natural daylight.
                </p>

                {/* Secondary Camera Button */}
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-trigger-camera"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-bold transition min-h-[40px] cursor-pointer"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>Use Device Camera</span>
                  </button>
                </div>
              </div>
            )}

            {errors.image && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 break-words" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.image}</span>
              </p>
            )}
          </div>

          {/* Section 2: Crop Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="crop-name-input" className="block text-xs sm:text-sm font-bold text-stone-900">
                2. Crop Name / Species <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] sm:text-xs text-stone-500 truncate">e.g. Tomato, Maize, Apple</span>
            </div>
            <input
              id="crop-name-input"
              type="text"
              value={cropName}
              onChange={(e) => {
                setCropName(e.target.value);
                if (errors.cropName) setErrors((prev) => ({ ...prev, cropName: '' }));
              }}
              placeholder="Enter crop type (e.g., Tomato, Maize, Apple)..."
              maxLength={80}
              className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 transition min-h-[44px] ${
                errors.cropName
                  ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                  : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20'
              }`}
              required
            />
            {/* Quick Crop Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-500 font-semibold self-center mr-1">Quick pick:</span>
              {COMMON_CROPS.map((crop) => (
                <button
                  type="button"
                  key={crop}
                  onClick={() => {
                    setCropName(crop);
                    if (errors.cropName) setErrors((prev) => ({ ...prev, cropName: '' }));
                  }}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition cursor-pointer min-h-[34px] flex items-center justify-center ${
                    cropName.toLowerCase().includes(crop.toLowerCase())
                      ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
            {errors.cropName && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 break-words" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.cropName}</span>
              </p>
            )}
          </div>

          {/* Section 3: Observed Symptoms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="symptoms-input" className="block text-xs sm:text-sm font-bold text-stone-900">
                3. Observed Symptoms <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] sm:text-xs text-stone-500 shrink-0">{symptoms.length}/800</span>
            </div>
            <textarea
              id="symptoms-input"
              rows={3}
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                if (errors.symptoms) setErrors((prev) => ({ ...prev, symptoms: '' }));
              }}
              placeholder="Describe symptoms in detail (e.g., spot color, concentric rings, leaf margin yellowing, wilting, curling, powdery growth, leaf undersides)..."
              maxLength={800}
              className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 transition leading-relaxed ${
                errors.symptoms
                  ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                  : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20'
              }`}
              required
            />
            {errors.symptoms && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 break-words" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.symptoms}</span>
              </p>
            )}
          </div>

          {/* Section 4: Agronomic Context Grid (Duration, Weather, Irrigation) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-1">
            {/* Duration */}
            <div className="space-y-2">
              <label htmlFor="duration-input" className="block text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Symptom Duration <span className="text-red-600">*</span></span>
              </label>
              <input
                id="duration-input"
                type="text"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  if (errors.duration) setErrors((prev) => ({ ...prev, duration: '' }));
                }}
                placeholder="Enter duration (e.g., 4 days)..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition min-h-[44px] ${
                  errors.duration
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20'
                }`}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setDuration(preset);
                      if (errors.duration) setErrors((prev) => ({ ...prev, duration: '' }));
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer min-h-[30px] flex items-center justify-center ${
                      duration.trim() === preset ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              {errors.duration && (
                <p className="text-xs text-red-600 mt-1 break-words">{errors.duration}</p>
              )}
            </div>

            {/* Weather / Rainfall */}
            <div className="space-y-2">
              <label htmlFor="weather-input" className="block text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Recent Weather <span className="text-red-600">*</span></span>
              </label>
              <input
                id="weather-input"
                type="text"
                value={weather}
                onChange={(e) => {
                  setWeather(e.target.value);
                  if (errors.weather) setErrors((prev) => ({ ...prev, weather: '' }));
                }}
                placeholder="Enter weather (e.g., heavy rain)..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition min-h-[44px] ${
                  errors.weather
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20'
                }`}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {WEATHER_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setWeather(preset);
                      if (errors.weather) setErrors((prev) => ({ ...prev, weather: '' }));
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg transition truncate max-w-[200px] cursor-pointer min-h-[30px] flex items-center justify-center ${
                      weather.trim() === preset ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                    title={preset}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              {errors.weather && (
                <p className="text-xs text-red-600 mt-1 break-words">{errors.weather}</p>
              )}
            </div>

            {/* Irrigation */}
            <div className="space-y-2">
              <label htmlFor="irrigation-input" className="block text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Irrigation Method <span className="text-red-600">*</span></span>
              </label>
              <input
                id="irrigation-input"
                type="text"
                value={irrigation}
                onChange={(e) => {
                  setIrrigation(e.target.value);
                  if (errors.irrigation) setErrors((prev) => ({ ...prev, irrigation: '' }));
                }}
                placeholder="Enter irrigation (e.g., drip)..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition min-h-[44px] ${
                  errors.irrigation
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                    : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-600/20'
                }`}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {IRRIGATION_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setIrrigation(preset);
                      if (errors.irrigation) setErrors((prev) => ({ ...prev, irrigation: '' }));
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg transition truncate max-w-[200px] cursor-pointer min-h-[30px] flex items-center justify-center ${
                      irrigation.trim() === preset ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                    title={preset}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              {errors.irrigation && (
                <p className="text-xs text-red-600 mt-1 break-words">{errors.irrigation}</p>
              )}
            </div>
          </div>

          {/* Section 5: Optional Additional Notes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="notes-input" className="block text-xs sm:text-sm font-bold text-stone-700">
                Additional Agronomic Notes <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-stone-400 truncate">Fertilizer, soil type, crop stage</span>
            </div>
            <input
              id="notes-input"
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Optional notes (e.g., NPK applied 3 weeks ago, clay loam soil, flowering stage)..."
              maxLength={250}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition min-h-[44px]"
            />
          </div>

          {/* Section 6: Language Selection */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="language-select" className="block text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Diagnosis Language</span>
              </label>
              <span className="text-[11px] text-stone-500">Multilingual Gemini Synthesis</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { code: 'en' as Language, label: 'English', native: 'English' },
                { code: 'te' as Language, label: 'Telugu', native: 'తెలుగు' },
                { code: 'hi' as Language, label: 'Hindi', native: 'हिन्दी' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  id={`lang-select-${lang.code}`}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition cursor-pointer min-h-[52px] ${
                    language === lang.code
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-600/20 shadow-2xs'
                      : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{lang.label}</span>
                  <span className={`text-[11px] ${language === lang.code ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                    {lang.native}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 7: Submit Button & Progress */}
          <div className="pt-4 sm:pt-6 border-t border-stone-200">
            {isAnalyzing ? (
              <div className="bg-emerald-50 rounded-2xl p-5 sm:p-6 border border-emerald-200 text-center space-y-3 sm:space-y-4 animate-pulse">
                <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-emerald-950">
                    Evaluating with LeafLogic Multimodal AI...
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Checking optical clarity • Enforcing Confidence Gate • Synthesizing safe next steps
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] sm:text-xs text-stone-500 text-center sm:text-left leading-relaxed">
                  🔒 Images and farm data remain private. Processed server-side without permanent retention.
                </div>
                <button
                  type="submit"
                  id="btn-analyze-submit"
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-base shadow-sm hover:bg-emerald-800 active:scale-98 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>Analyze with LeafLogic</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
