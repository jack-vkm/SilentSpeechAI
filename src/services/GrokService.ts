import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const BASE = 'https://api.x.ai/v1';
const MODEL = 'grok-4.5';
const DEFAULT_TIMEOUT = 120000; // 2 minutes
const MAX_RETRIES = 3;

const API_KEY = Constants.expoConfig?.extra?.XAI_API_KEY || process.env.XAI_API_KEY || process.env.XAI_API_KEY || '';

const client: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
});

type GrokResult = { predictedText: string; confidence: number; processingTime: number };

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function toBase64(uri: string) {
  // Read file and return data URI base64
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    // Try to guess mime from extension
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    // If uri already base64
    if (uri.startsWith('data:')) return uri;
    throw e;
  }
}

function parseJsonResponse(obj: any): { predictedText: string; confidence: number } {
  // Attempt to locate the JSON payload in common fields
  if (!obj) return { predictedText: '', confidence: 0 };

  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      return { predictedText: parsed.predictedText || '', confidence: parsed.confidence || 0 };
    } catch (e) {
      // try to extract JSON substring
      const m = obj.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const parsed = JSON.parse(m[0]);
          return { predictedText: parsed.predictedText || '', confidence: parsed.confidence || 0 };
        } catch (e2) {}
      }
      return { predictedText: String(obj), confidence: 0 };
    }
  }

  if (typeof obj === 'object') {
    if (obj.predictedText || obj.confidence !== undefined) return { predictedText: obj.predictedText || '', confidence: obj.confidence || 0 };
    if (obj.output) return parseJsonResponse(obj.output);
    if (obj.data) return parseJsonResponse(obj.data);
    // fallback
    return { predictedText: JSON.stringify(obj), confidence: 0 };
  }

  return { predictedText: '', confidence: 0 };
}

async function postWithRetries(path: string, body: any, retries = MAX_RETRIES): Promise<any> {
  let attempt = 0;
  let lastError: any;
  while (attempt < retries) {
    try {
      const start = Date.now();
      const res = await client.post(path, body);
      const processingTime = Date.now() - start;
      return { data: res.data, processingTime };
    } catch (err: any) {
      lastError = err;
      attempt += 1;
      const status = err?.response?.status;
      // retry on network errors or 5xx
      if (attempt >= retries || (status && status < 500)) break;
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

export default {
  async analyzeFrames(frames: string[]): Promise<GrokResult> {
    const startAll = Date.now();
    const base64s = [] as string[];
    for (const f of frames) {
      const b = await toBase64(f);
      base64s.push(b);
    }

    const prompt = `You are a visual speech recognition assistant.\n\nAnalyze the sequence of video frames showing a person's lips and facial movements.\n\nPredict what the person is attempting to say.\n\nReturn JSON only:\n\n{\n\"predictedText\": \"\",\n\"confidence\": 0\n}`;

    const payload = {
      model: MODEL,
      input: {
        type: 'vision_sequence',
        frames: base64s,
        prompt
      }
    };

    const res = await postWithRetries(`/models/${MODEL}/vision`, payload);
    const processingTime = res.processingTime + (Date.now() - startAll - res.processingTime);

    // Attempt to parse response
    const parsed = parseJsonResponse(res.data);
    return { predictedText: parsed.predictedText, confidence: parsed.confidence || 0, processingTime };
  },

  async analyzeImage(base64Image: string): Promise<GrokResult> {
    const b64 = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    const prompt = `You are a visual speech recognition assistant.\n\nAnalyze the image showing a person's lips and facial movements.\n\nPredict what the person is attempting to say.\n\nReturn JSON only:\n\n{\n\"predictedText\": \"\",\n\"confidence\": 0\n}`;

    const payload = {
      model: MODEL,
      input: {
        type: 'vision_image',
        image: b64,
        prompt
      }
    };

    const res = await postWithRetries(`/models/${MODEL}/vision`, payload);
    const parsed = parseJsonResponse(res.data);
    return { predictedText: parsed.predictedText, confidence: parsed.confidence || 0, processingTime: res.processingTime };
  },

  async getPrediction(videoFrames: string[]): Promise<GrokResult> {
    return this.analyzeFrames(videoFrames);
  },

  async processVideo(videoUri: string): Promise<GrokResult> {
    try {
      // Extract frames from the video using CameraService
      const CameraService = require('./CameraService').default;
      const frames = await CameraService.captureFramesFromVideo(videoUri);
      
      // Analyze the extracted frames
      return await this.analyzeFrames(frames);
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }
};
