const DEMO_SENTENCES = [
  'hi my name is jack',
  'hi my name is jack this is MAD review',
  'this is silentspeach ai app',
];

let nextSentenceIndex = 0;

export type DemoRecognitionResult = {
  predictedText: string;
  confidence: number;
  processingTime: number;
  source: 'demo';
};

export default {
  async analyzeRecording(): Promise<DemoRecognitionResult> {
    const startedAt = Date.now();
    const predictedText = DEMO_SENTENCES[nextSentenceIndex];
    nextSentenceIndex = (nextSentenceIndex + 1) % DEMO_SENTENCES.length;

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      predictedText,
      confidence: 0,
      processingTime: Date.now() - startedAt,
      source: 'demo',
    };
  },
};
