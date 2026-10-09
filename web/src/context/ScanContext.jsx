import React, { createContext, useContext, useState } from 'react';

// Sample demo records for demonstration when backend history API is unavailable
const DEMO_SCANS = [
  {
    id: 'demo-1',
    filename: 'sample_brain_mri_glioma_t2.png',
    uploadDate: '2026-10-02 14:22',
    dimensions: '512 × 512 px',
    fileSize: '1.4 MB',
    status: 'success',
    statusLabel: 'Sample Analysis Complete',
    isDemo: true,
    thumbnailUrl: null, // SVG placeholder
    tumorCategory: 'Glioma',
    prediction: 'Glioma',
    confidence: 0.948,
    probabilities: {
      Glioma: 0.948,
      Meningioma: 0.032,
      'No Tumor': 0.006,
      Pituitary: 0.014,
    },
  },
  {
    id: 'demo-2',
    filename: 'sample_mri_meningioma_sagittal.jpg',
    uploadDate: '2026-10-01 09:45',
    dimensions: '256 × 256 px',
    fileSize: '840 KB',
    status: 'success',
    statusLabel: 'Sample Analysis Complete',
    isDemo: true,
    thumbnailUrl: null,
    tumorCategory: 'Meningioma',
    prediction: 'Meningioma',
    confidence: 0.912,
    probabilities: {
      Glioma: 0.045,
      Meningioma: 0.912,
      'No Tumor': 0.018,
      Pituitary: 0.025,
    },
  },
  {
    id: 'demo-3',
    filename: 'sample_normal_brain_scan.png',
    uploadDate: '2026-09-28 17:10',
    dimensions: '512 × 512 px',
    fileSize: '1.1 MB',
    status: 'success',
    statusLabel: 'Sample Analysis Complete',
    isDemo: true,
    thumbnailUrl: null,
    tumorCategory: 'No Tumor',
    prediction: 'No Tumor',
    confidence: 0.985,
    probabilities: {
      Glioma: 0.005,
      Meningioma: 0.006,
      'No Tumor': 0.985,
      Pituitary: 0.004,
    },
  },
  {
    id: 'demo-4',
    filename: 'sample_pituitary_adenoma_coronal.jpg',
    uploadDate: '2026-09-25 11:30',
    dimensions: '512 × 512 px',
    fileSize: '1.8 MB',
    status: 'success',
    statusLabel: 'Sample Analysis Complete',
    isDemo: true,
    thumbnailUrl: null,
    tumorCategory: 'Pituitary',
    prediction: 'Pituitary',
    confidence: 0.934,
    probabilities: {
      Glioma: 0.021,
      Meningioma: 0.033,
      'No Tumor': 0.012,
      Pituitary: 0.934,
    },
  }
];

const ScanContext = createContext(null);

export const ScanProvider = ({ children }) => {
  const [userUploads, setUserUploads] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);

  /**
   * Register a newly uploaded scan / prediction returned from FastAPI server
   */
  const addUploadedScan = (apiResponse, fileObject, previewUrl, fileDimensions = null) => {
    const prediction =
      apiResponse?.prediction ||
      apiResponse?.predicted_class ||
      apiResponse?.class ||
      apiResponse?.class_name ||
      apiResponse?.label ||
      null;

    const confidence =
      apiResponse?.confidence !== undefined ? apiResponse.confidence :
        apiResponse?.confidence_score !== undefined ? apiResponse.confidence_score :
          apiResponse?.score !== undefined ? apiResponse.score :
            null;

    const probabilities =
      apiResponse?.probabilities ||
      apiResponse?.class_probabilities ||
      apiResponse?.probs ||
      null;

    const gradcamOverlay =
      apiResponse?.gradcam_overlay ||
      apiResponse?.gradcamOverlay ||
      apiResponse?.heatmap_overlay ||
      null;

    const gradcamLayer =
      apiResponse?.gradcam_layer ||
      apiResponse?.gradcamLayer ||
      'conv5_block3_3_conv';

    const dimensions = fileDimensions
      ? fileDimensions
      : apiResponse?.image_width && apiResponse?.image_height
        ? `${apiResponse.image_width} × ${apiResponse.image_height} px`
        : 'Native dimensions';

    const newScan = {
      id: `upload-${Date.now()}`,
      filename: apiResponse?.filename || fileObject?.name || 'brain_mri_scan.png',
      uploadDate: new Date().toLocaleString(),
      dimensions,
      fileSize: fileObject ? `${(fileObject.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size',
      status: prediction ? 'success' : 'uploaded',
      statusLabel: prediction ? `Analysis Complete: ${prediction}` : 'Backend Upload Confirmed',
      isDemo: false,
      thumbnailUrl: previewUrl || null,
      gradcamOverlay,
      gradcamLayer,
      rawResponse: apiResponse,
      predictionResponse: apiResponse,
      prediction,
      confidence,
      probabilities,
      message: apiResponse?.message || 'Brain MRI analysis completed successfully.'
    };

    setUserUploads((prev) => [newScan, ...prev]);
    setCurrentScan(newScan);
    return newScan;
  };

  const allScans = [...userUploads, ...DEMO_SCANS];

  return (
    <ScanContext.Provider
      value={{
        userUploads,
        demoScans: DEMO_SCANS,
        allScans,
        currentScan,
        setCurrentScan,
        addUploadedScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScans = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScans must be used within a ScanProvider');
  }
  return context;
};

