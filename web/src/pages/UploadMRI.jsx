import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertCircle,
  X,
  HardDrive,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Server
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DisclaimerBanner from '../components/common/Disclaimer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { uploadMRI, predictMRI } from '../services/api';
import { useScans } from '../context/ScanContext';

const MAX_FILE_SIZE_MB = 15;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export const UploadMRI = () => {
  const navigate = useNavigate();
  const { addUploadedScan } = useScans();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileDimensions, setFileDimensions] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setValidationError('');
    setApiError('');
    setUploadSuccess(null);

    if (!file) return false;

    // Check file extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      setValidationError(`Invalid file format '${ext}'. Please select a JPG, JPEG, or PNG image.`);
      return false;
    }

    // Check file size
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      setValidationError(`File size (${sizeMb.toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileDimensions(null);
      return;
    }

    setSelectedFile(file);

    // Read image dimensions & create object URL preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setFileDimensions(`${img.width} × ${img.height} px`);
    };
    img.src = objectUrl;
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileDimensions(null);
    setValidationError('');
    setApiError('');
    setUploadSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    if (!validateFile(selectedFile)) return;

    setIsUploading(true);
    setApiError('');
    setUploadSuccess(null);

    try {
      // Send selected MRI image to FastAPI /predict endpoint with input validation
      const result = await predictMRI(selectedFile);

      // Store in ScanContext with file object and preview URL
      const newScan = addUploadedScan(result, selectedFile, previewUrl, fileDimensions);

      setUploadSuccess({
        raw: result,
        scan: newScan,
        filename: result.filename || selectedFile.name,
        width: result.image_width,
        height: result.image_height,
        message: result.message || 'MRI scan successfully analyzed by FastAPI server.'
      });

      // Automatically navigate to Scan Results page to display prediction details
      navigate('/results');
    } catch (err) {
      console.error('Prediction request failed:', err);
      const isValidationError = err.message && err.message.toLowerCase().includes('brain mri');
      if (isValidationError) {
        setValidationError(err.message);
      } else {
        setApiError(
          err.message || 'Failed to connect to FastAPI backend server. Ensure FastAPI is running on http://127.0.0.1:8000.'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Upload MRI Scan"
        badge="FastAPI Connected"
      />

      <DisclaimerBanner compact={true} />

      {/* Main Upload Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Upload Success State */}
        {uploadSuccess ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-extrabold text-emerald-950">
                  MRI Analysis Confirmed by Backend!
                </h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  {uploadSuccess.message}
                </p>
              </div>
            </div>

            {/* Response details box */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200/80 space-y-2 text-xs font-mono text-slate-700">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>FastAPI POST /predict Response Payload</span>
                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded font-mono">HTTP 200 OK</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-slate-400">Filename:</span>{' '}
                  <span className="font-bold text-slate-900">{uploadSuccess.filename}</span>
                </div>
                {uploadSuccess.width && (
                  <div>
                    <span className="text-slate-400">Width:</span>{' '}
                    <span className="font-bold text-slate-900">{uploadSuccess.width} px</span>
                  </div>
                )}
                {uploadSuccess.height && (
                  <div>
                    <span className="text-slate-400">Height:</span>{' '}
                    <span className="font-bold text-slate-900">{uploadSuccess.height} px</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions after upload */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/results')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Scan Results & Classification</span>
              </button>

              <button
                onClick={handleRemoveFile}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm border border-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Upload Another MRI</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitUpload} className="space-y-6">
            {/* Drag and Drop Zone */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                />

                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-100">
                  <UploadCloud className="w-10 h-10" />
                </div>

                <div className="space-y-1 max-w-md">
                  <h3 className="text-base font-bold text-slate-900">
                    Drag and drop your MRI image here, or <span className="text-blue-600 underline">browse</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supports high-resolution brain MRI scans in <strong>JPG</strong>, <strong>JPEG</strong>, or <strong>PNG</strong> formats (up to {MAX_FILE_SIZE_MB} MB).
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-2">
                  <Server className="w-3.5 h-3.5 text-teal-500" />
                  <span>Directly connected to FastAPI POST /predict</span>
                </div>
              </div>
            ) : (
              /* Selected Image Preview Area */
              <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                    <FileImage className="w-4 h-4" />
                    <span>Selected MRI Preview</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Image Preview Thumbnail */}
                  <div className="relative w-40 h-40 bg-black rounded-xl overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Selected MRI preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileImage className="w-12 h-12 text-slate-600" />
                    )}
                  </div>

                  {/* Metadata readout */}
                  <div className="space-y-3 flex-1 text-xs w-full">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                        Filename
                      </span>
                      <p className="font-mono text-sm font-bold text-white truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 text-[10px] block">File Size</span>
                        <span className="font-mono font-bold text-slate-200">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 text-[10px] block">Resolution</span>
                        <span className="font-mono font-bold text-slate-200">
                          {fileDimensions || 'Calculating...'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>Ready for FastAPI multipart form prediction request</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Brain MRI Validation Error Alert */}
            {validationError && (
              <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 text-amber-950 space-y-3 animate-fade-in shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 border border-amber-200">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-amber-950 tracking-tight">
                        Brain MRI Validation Stage Rejected Image
                      </h4>
                      <span className="text-[10px] font-mono uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Input Filter Active
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      {validationError}
                    </p>
                    <p className="text-[11px] text-amber-800 leading-normal pt-1">
                      To protect diagnostic prediction integrity, non-brain-MRI inputs (such as everyday objects, animals, outdoor scenes, or non-cranial images) are blocked from reaching the tumor classification network.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/70">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Another Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* API Error Alert */}
            {apiError && (
              <ErrorMessage
                title="Prediction Request Failed"
                message={apiError}
                onRetry={() => handleSubmitUpload({ preventDefault: () => {} })}
              />
            )}

            {/* Upload & Predict Button */}
            {selectedFile && !uploadSuccess && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer ${
                    isUploading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 shadow-yellow-500/25'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing MRI with AI Model...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-teal-300" />
                      <span>Upload & Predict Brain Tumor</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          <span>Backend Prediction Pipeline Specifications</span>
        </h4>
        <p className="leading-relaxed">
          The selected file will be transmitted directly to the FastAPI server at <code>POST /predict</code> using <code>multipart/form-data</code> encoding. The model pre-processes the MRI scan, computes neural net inference scores, and returns predicted class, confidence, and class probabilities.
        </p>
      </div>
    </div>
  );
};

export default UploadMRI;

