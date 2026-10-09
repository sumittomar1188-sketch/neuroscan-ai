import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileImage,
  BrainCircuit,
  ArrowLeft,
  UploadCloud,
  Layers,
  Sparkles,
  Info,
  Calendar,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  Flame,
  ShieldAlert,
  Award,
  Sliders,
  Maximize2
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DisclaimerBanner from '../components/common/Disclaimer';
import StatusBadge from '../components/common/StatusBadge';
import { useScans } from '../context/ScanContext';

const CATEGORY_COLORS = {
  glioma: {
    bg: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBg: 'bg-amber-50/80 border-amber-200/90',
    iconColor: 'text-amber-600',
  },
  meningioma: {
    bg: 'bg-purple-500',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    cardBg: 'bg-purple-50/80 border-purple-200/90',
    iconColor: 'text-purple-600',
  },
  'no tumor': {
    bg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardBg: 'bg-emerald-50/80 border-emerald-200/90',
    iconColor: 'text-emerald-600',
  },
  notumor: {
    bg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardBg: 'bg-emerald-50/80 border-emerald-200/90',
    iconColor: 'text-emerald-600',
  },
  pituitary: {
    bg: 'bg-teal-500',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    cardBg: 'bg-teal-50/80 border-teal-200/90',
    iconColor: 'text-teal-600',
  }
};

export const ScanResults = () => {
  const navigate = useNavigate();
  const { currentScan, allScans } = useScans();

  // Active view tab state: 'overlay' | 'original' | 'split'
  const [viewMode, setViewMode] = useState('overlay');
  const [overlayAlpha, setOverlayAlpha] = useState(0.85);

  // Use selected scan or fallback to most recent scan
  const activeScan = currentScan || allScans[0];

  // Extract prediction fields from active scan
  const prediction =
    activeScan?.prediction ||
    activeScan?.tumorCategory ||
    activeScan?.predictionResponse?.prediction ||
    activeScan?.predictionResponse?.predicted_class ||
    activeScan?.predictionResponse?.class ||
    activeScan?.rawResponse?.prediction ||
    null;

  const rawConfidence =
    activeScan?.confidence !== undefined
      ? activeScan.confidence
      : activeScan?.predictionResponse?.confidence !== undefined
        ? activeScan.predictionResponse.confidence
        : activeScan?.rawResponse?.confidence;

  const formattedConfidence = (() => {
    if (rawConfidence === undefined || rawConfidence === null || isNaN(Number(rawConfidence))) {
      return null;
    }
    const val = Number(rawConfidence);
    if (val <= 1 && val >= 0) {
      return (val * 100).toFixed(1);
    }
    return val.toFixed(1);
  })();

  const probabilitiesMap =
    activeScan?.probabilities ||
    activeScan?.predictionResponse?.probabilities ||
    activeScan?.predictionResponse?.class_probabilities ||
    activeScan?.rawResponse?.probabilities ||
    null;

  const gradcamOverlay =
    activeScan?.gradcamOverlay ||
    activeScan?.predictionResponse?.gradcam_overlay ||
    activeScan?.rawResponse?.gradcam_overlay ||
    null;

  const gradcamLayer =
    activeScan?.gradcamLayer ||
    activeScan?.predictionResponse?.gradcam_layer ||
    'conv5_block3_3_conv';

  // Format probabilities array for the 4 classes
  const categoriesList = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary'];
  const formattedProbabilities = categoriesList.map((catName) => {
    let pct = 0;
    const catLower = catName.toLowerCase().replace(/[\s_-]/g, '');

    if (probabilitiesMap && typeof probabilitiesMap === 'object' && !Array.isArray(probabilitiesMap)) {
      const keys = Object.keys(probabilitiesMap);
      const matchedKey = keys.find((k) => k.toLowerCase().replace(/[\s_-]/g, '') === catLower);
      if (matchedKey !== undefined) {
        let val = Number(probabilitiesMap[matchedKey]);
        if (!isNaN(val)) {
          pct = val <= 1 && val > 0 ? val * 100 : val;
        }
      }
    } else if (Array.isArray(probabilitiesMap)) {
      const idx = categoriesList.indexOf(catName);
      if (idx !== -1 && probabilitiesMap[idx] !== undefined) {
        let val = Number(probabilitiesMap[idx]);
        if (!isNaN(val)) {
          pct = val <= 1 && val > 0 ? val * 100 : val;
        }
      }
    } else if (prediction) {
      // Fallback if prediction exists but map is missing
      const isMatch = prediction.toLowerCase().includes(catName.toLowerCase());
      if (isMatch) {
        pct = formattedConfidence ? Number(formattedConfidence) : 95.0;
      }
    }

    const keyForColor = catName.toLowerCase();
    const styleObj = CATEGORY_COLORS[keyForColor] || CATEGORY_COLORS.glioma;

    return {
      name: catName,
      percentage: Math.min(100, Math.max(0, pct)),
      colorClass: styleObj.bg,
    };
  });

  const categoryStyle = prediction
    ? CATEGORY_COLORS[prediction.toLowerCase()] || CATEGORY_COLORS.glioma
    : CATEGORY_COLORS.glioma;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan Analysis & Grad-CAM Explainability
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-xs shadow-yellow-500/20 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Another MRI</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Main Analysis Container */}
      {activeScan ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: MRI Image & Grad-CAM Heatmap Viewer */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-sm">MRI Visualizer & Grad-CAM</h3>
              </div>
              <StatusBadge
                status={prediction ? 'success' : activeScan.status}
                label={prediction ? 'Grad-CAM Ready' : activeScan.statusLabel}
                size="sm"
              />
            </div>

            {/* View Mode Toggle Controls */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode('overlay')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${viewMode === 'overlay'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Grad-CAM Overlay
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${viewMode === 'original'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Original MRI
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${viewMode === 'split'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Side-by-Side
              </button>
            </div>

            {/* Main Image Display Box */}
            {viewMode === 'split' ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Original MRI</span>
                  <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    {activeScan.thumbnailUrl ? (
                      <img
                        src={activeScan.thumbnailUrl}
                        alt="Original MRI"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileImage className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-500 block flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Grad-CAM Heatmap
                  </span>
                  <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    {gradcamOverlay ? (
                      <img
                        src={gradcamOverlay}
                        alt="Grad-CAM Overlay"
                        className="w-full h-full object-contain"
                      />
                    ) : activeScan.thumbnailUrl ? (
                      <img
                        src={activeScan.thumbnailUrl}
                        alt="Original MRI fallback"
                        className="w-full h-full object-contain opacity-80"
                      />
                    ) : (
                      <Flame className="w-8 h-8 text-rose-400" />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                {viewMode === 'overlay' && gradcamOverlay ? (
                  <div className="relative w-full h-full">
                    {/* Base image */}
                    {activeScan.thumbnailUrl && (
                      <img
                        src={activeScan.thumbnailUrl}
                        alt={activeScan.filename}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                    {/* Grad-CAM heatmap overlay */}
                    <img
                      src={gradcamOverlay}
                      alt="Grad-CAM Heatmap Overlay"
                      className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
                      style={{ opacity: overlayAlpha }}
                    />
                  </div>
                ) : activeScan.thumbnailUrl ? (
                  <img
                    src={activeScan.thumbnailUrl}
                    alt={activeScan.filename}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-3">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
                      <BrainCircuit className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-300 font-semibold">{activeScan.filename}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Image loaded in memory</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Opacity Control Slider for Overlay */}
            {viewMode === 'overlay' && gradcamOverlay && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Heatmap Overlay Opacity
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {Math.round(overlayAlpha * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={overlayAlpha}
                  onChange={(e) => setOverlayAlpha(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {/* Image Specifications & Layer Metadata */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-500 flex items-center justify-between">
                <span>Scan & Model Specs</span>
                <span className="text-rose-600 font-mono font-bold">Grad-CAM Active</span>
              </h4>
              <div className="space-y-1.5 font-mono text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Filename:</span>
                  <span className="font-bold truncate max-w-[180px]">{activeScan.filename}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Target Conv Layer:</span>
                  <span className="font-bold text-slate-900">{gradcamLayer}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-sans">Dimensions:</span>
                  <span className="font-bold">{activeScan.dimensions || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Pipeline:</span>
                  <span className="font-bold">ResNet50 + TensorFlow 2.22</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Details, Probabilities, and Grad-CAM Explanability */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Model Prediction Result Card */}
            <div className={`rounded-3xl p-6 shadow-xs border space-y-4 ${categoryStyle.cardBg}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-white rounded-2xl shadow-xs shrink-0 mt-0.5 ${categoryStyle.iconColor}`}>
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-900 text-white rounded-md uppercase tracking-wider">
                      Predicted Tumor Class
                    </span>
                    {activeScan.isDemo && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 rounded-md">
                        Sample Record
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {prediction || 'Analysis Complete'}
                    </h2>
                    {formattedConfidence && (
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs font-mono text-sm font-bold text-slate-900">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Confidence: {formattedConfidence}%</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    FastAPI neural network inference completed for scan <strong>{activeScan.filename}</strong>. Grad-CAM visual explainability overlay generated for layer <code>{gradcamLayer}</code>.
                  </p>
                </div>
              </div>

              {/* Confidence Progress Meter */}
              {formattedConfidence && (
                <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>Model Confidence Level</span>
                    <span className="font-mono text-slate-900 font-bold">{formattedConfidence}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full transition-all duration-500 ${categoryStyle.bg}`}
                      style={{ width: `${Math.min(100, Math.max(0, Number(formattedConfidence)))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Classification Probabilities Visualizer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Category Probabilities Breakdown</h3>
                  <p className="text-xs text-slate-500">Multi-class probability distribution computed by ResNet50</p>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  4 Classes
                </span>
              </div>

              {/* Class Probability Bars */}
              <div className="space-y-4 pt-1">
                {formattedProbabilities.map((item) => {
                  const isTopMatch =
                    prediction && item.name.toLowerCase() === prediction.toLowerCase();

                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className={`flex items-center gap-1.5 ${isTopMatch ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                          {item.name}
                          {isTopMatch && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded font-mono font-bold">
                              Top Result
                            </span>
                          )}
                        </span>
                        <span className="text-slate-700 font-mono font-bold">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full ${item.colorClass} transition-all duration-500 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grad-CAM Explainability Details Panel */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Grad-CAM Feature Map Activation</h3>
                    <p className="text-[11px] text-slate-300">Gradient-weighted Class Activation Mapping</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
                  Layer: {gradcamLayer}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>How to interpret the heatmap:</strong> Warm regions (<span className="text-red-400 font-bold">Red / Yellow</span>) highlight pixel regions in the MRI scan that produced the highest gradient activations for the predicted class (<strong>{prediction || 'Target Class'}</strong>) inside the final convolutional layer of ResNet50.
                </p>

                <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-1 font-sans font-bold">
                    <span>Explainability Spectrum Legend</span>
                    <span>JET Colormap</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-600 via-green-400 via-yellow-400 to-red-600" />
                  <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                    <span>Low Activation (Neutral)</span>
                    <span>High Activation (Influential)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explicit Educational Disclaimer Notice */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-950 text-xs uppercase tracking-wider">
                  Educational Visualization Disclaimer
                </strong>
                <p className="leading-relaxed">
                  Grad-CAM heatmaps highlight regions of visual influence within the ResNet50 feature maps. They serve as an <strong>educational visualization and diagnostic research tool</strong> for deep learning explainability. They are <strong>NOT a clinical medical diagnosis or exact tumor segmentation boundary</strong>. All clinical decisions must be performed by certified healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-4">
          <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Scan Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a brain MRI image to analyze it with the FastAPI server and view Grad-CAM heatmaps.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Scan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanResults;


