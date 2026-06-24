import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getStreamUrl = () => `${API_BASE_URL}/video_feed`;

const deriveQualityStatus = (blurScores, bestFrameIndex) => {
  const score = blurScores?.[bestFrameIndex] ?? 0;
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Acceptable';
  return 'Blurry (Adjust Focus)';
};

const basename = (fullPath) =>
  fullPath ? fullPath.split(/[\\/]/).pop() : null;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * POST /capture — shoot frames, pick sharpest, save best frame.
 */
export const captureImage = async () => {
  try {
    const { data } = await client.post('/capture');
    const bestScore = data.blur_scores?.[data.best_frame_index] ?? 0;

    return {
      image_name:       data.image_name,
      best_frame_index: data.best_frame_index,
      blur_scores:      data.blur_scores,
      blur_score:       bestScore,
      quality_status:   deriveQualityStatus(data.blur_scores, data.best_frame_index),
      best_image:       `${API_BASE_URL}/images/best_images/${data.image_name}`,
      image_width:      data.image_width,
      image_height:     data.image_height,
    };
  } catch (error) {
    console.error('Capture API error:', error);
    throw new Error(
      error.response?.data?.detail ||
      'Failed to capture image. Is the backend running on port 8000?'
    );
  }
};

/**
 * POST /analyze_roi — crop user-selected ROI and compute average colour.
 */
export const analyzeRoi = async (imageName, crop) => {
  try {
    const { data } = await client.post('/analyze_roi', {
      image_name: imageName,
      roi_x:      crop.x,
      roi_y:      crop.y,
      roi_width:  crop.width,
      roi_height: crop.height,
    });

    return {
      image_name:     data.image_name,
      roi_image_name: data.roi_image_name,
      roi_x:          data.roi_x,
      roi_y:          data.roi_y,
      roi_width:      data.roi_width,
      roi_height:     data.roi_height,
      roi_image:      `${API_BASE_URL}/images/best_images/${basename(data.roi_image_path)}`,
      color_features: data.color_features,
    };
  } catch (error) {
    console.error('Analyze ROI API error:', error);
    throw new Error(
      error.response?.data?.detail ||
      'Failed to analyze ROI. Is the backend running on port 8000?'
    );
  }
};

/**
 * POST /save_dataset — persist best frame + ROI + colour + labels.
 */
export const saveDataset = async (payload) => {
  try {
    const { data } = await client.post('/save_dataset', {
      image_name:     payload.image_name,
      save_name:      payload.save_name,
      ph_meter_value: payload.ph_value,
      water_class:    payload.water_class,
      water_source:   payload.water_source,
      // Pass color overrides if user picked a color
      hex:            payload.hex,
      R:              payload.R,
      G:              payload.G,
      B:              payload.B,
      H:              payload.H,
      S:              payload.S,
      V:              payload.V,
      L:              payload.L,
      A:              payload.A,
      B_lab:          payload.B_lab,
    });
    return data;
  } catch (error) {
    console.error('Save Dataset API error:', error);
    throw new Error(
      error.response?.data?.detail ||
      'Failed to save dataset record. Is the backend running on port 8000?'
    );
  }
};

export default client;
