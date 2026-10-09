/**
 * NeuroScan AI - Backend API Service
 * Encapsulates all backend communication with the FastAPI server.
 * Uses relative proxy path /api in development to bypass CORS restrictions.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get configured backend base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Check backend status (Root endpoint)
 */
export const checkApiRoot = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend root endpoint error:', error);
    throw error;
  }
};

/**
 * Check health of backend server (GET /health)
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend health check error:', error);
    throw error;
  }
};

/**
 * Upload MRI image file to FastAPI server (POST /upload-mri)
 * @param {File} file - JPG, JPEG, or PNG file object
 * @returns {Promise<Object>} Backend JSON response with filename, width, height, success message
 */
export const uploadMRI = async (file) => {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  const formData = new FormData();
  // FastAPI endpoint expects multipart form data with file field 'file'
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload-mri`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API uploadMRI Error:', error);
    throw error;
  }
};


/**
 * Predict brain tumor from uploaded MRI image (POST /predict)
 * @param {File} file - JPG, JPEG, or PNG image
 * @returns {Promise<Object>} Prediction and class probabilities
 */
export const predictMRI = async (file) => {
  if (!file) {
    throw new Error('No MRI image selected for prediction.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.detail ||
        data?.message ||
        `Prediction failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API predictMRI Error:', error);
    throw error;
  }
};