import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import DemoRecognitionService from './DemoRecognitionService';
import StorageService from './StorageService';

export interface UploadResult {
  predictedText: string;
  confidence: number;
  processingTime: number;
  fileName: string;
  recordId: string;
  source: 'demo';
}

const MediaUploadService = {
  async requestPermissions() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library access is required to upload videos');
        return false;
      }
    }
    return true;
  },

  async pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
      return null;
    }
  },

  async processVideo(videoUri: string, fileName: string): Promise<UploadResult> {
    try {
      const result = await DemoRecognitionService.analyzeRecording();
      
      const recordId = `${Date.now()}`;
      const record = {
        id: recordId,
        text: result.predictedText,
        fileName,
        confidence: result.confidence,
        processingTime: result.processingTime,
        createdAt: Date.now(),
      };
      
      await StorageService.save(record);

      return {
        predictedText: result.predictedText,
        confidence: result.confidence,
        processingTime: result.processingTime,
        fileName,
        recordId,
        source: result.source,
      };
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  },

  async captureVideoThumbnail(videoUri: string) {
    if (Platform.OS === 'web') return null;
    try {
      const VideoThumbnails = require('expo-video-thumbnails');
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000 });
      return uri;
    } catch (error) {
      console.error('Error capturing thumbnail:', error);
      return null;
    }
  },
};

export default MediaUploadService;
