import { useState, useCallback } from 'react';
import GrokService from '../services/GrokService';
import StorageService from '../services/StorageService';

type Result = { predictedText: string; confidence: number; processingTime: number } | null;

export default function useSpeechRecognition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);

  const analyzeVideo = useCallback(async (frames: string[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await GrokService.getPrediction(frames);
      const record = { id: String(Date.now()), text: res.predictedText, createdAt: Date.now() };
      // Save successful prediction
      await StorageService.save(record);
      setResult(res);
      return res;
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeImage = useCallback(async (base64Image: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await GrokService.analyzeImage(base64Image);
      const record = { id: String(Date.now()), text: res.predictedText, createdAt: Date.now() };
      await StorageService.save(record);
      setResult(res);
      return res;
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, analyzeVideo, analyzeImage } as const;
}
