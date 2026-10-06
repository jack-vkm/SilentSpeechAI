import * as Speech from 'expo-speech';

export default {
  speak(text: string, rate = 1.0, language?: string) {
    Speech.speak(text, { rate, language });
  },
  stop() {
    Speech.stop();
  }
};
