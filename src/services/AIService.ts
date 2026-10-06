import axios from 'axios';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.AI_API_KEY || process.env.AI_API_KEY || '';

const AI_BASE = 'https://api.example.com/v1/lipread';

export default {
  async uploadVideo(uri: string) {
    // Placeholder for uploading video to external AI service
    // Return an upload id or remote URL
    return { uploadId: 'placeholder-upload-id', uri };
  },

  async extractFrames(uri: string) {
    // Placeholder: either server-side or client-side frame extraction
    // Return array of base64 images or frame URIs
    return [uri];
  },

  async sendToAI(payload: { frames?: string[]; videoUrl?: string }) {
    // Example placeholder that would call an external API with API_KEY
    // Here we return a mocked prediction after a delay
    await new Promise(r => setTimeout(r, 1500));
    return { text: 'This is a mocked prediction of silent speech.' };
  },

  async getPrediction(uploadId: string) {
    // Polling / fetch method if the API processes asynchronously
    const res = await axios.get(`${AI_BASE}/predictions/${uploadId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    }).catch(() => null);

    if (!res) return { text: 'Prediction unavailable' };
    return res.data;
  }
};
