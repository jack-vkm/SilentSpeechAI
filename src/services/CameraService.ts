import { Platform } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

async function captureWebFrames(uri: string): Promise<string[]> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = uri;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('The browser could not open the recorded video.'));
      video.load();
    });

    if (!Number.isFinite(video.duration) || video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error('The recorded video has no readable frames.');
    }

    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 640 / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare video frames for recognition.');

    const positions = [...new Set([0.08, 0.45, 0.82].map(fraction => Math.min(
      Math.max(video.duration * fraction, 0),
      Math.max(video.duration - 0.04, 0)
    )))];
    const frames: string[] = [];
    for (const time of positions) {
      if (Math.abs(video.currentTime - time) > 0.01) {
        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error('Could not seek through the recorded video.'));
          video.currentTime = time;
        });
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.82));
    }

    if (!frames.length) throw new Error('No video frames were available for recognition.');
    return frames;
  } finally {
    video.removeAttribute('src');
    video.load();
  }
}

export default {
  async captureFramesFromVideo(uri: string): Promise<string[]> {
    if (Platform.OS === 'web') return captureWebFrames(uri);

    const frames: string[] = [];
    for (const time of [0, 1500, 3000]) {
      try {
        const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(uri, { time });
        frames.push(frameUri);
      } catch (error) {
        console.warn(`Could not extract video frame at ${time}ms:`, error);
      }
    }
    if (frames.length === 0) {
      throw new Error('The video was recorded, but its frames could not be extracted. Please record again and try a shorter clip.');
    }
    return frames;
  },
};
