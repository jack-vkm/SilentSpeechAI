import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, Alert, ActivityIndicator, Share } from 'react-native';
import SimpleButton from '../components/SimpleButton';
import MediaUploadService from '../services/MediaUploadService';
import SpeechService from '../services/SpeechService';
import * as Clipboard from 'expo-clipboard';

export default function VideoUploadScreen({ navigation }: any) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getSelectedFileName = () => {
    const candidate = selectedVideo?.fileName || selectedVideo?.name;
    if (candidate && candidate.length < 120 && !candidate.includes('/')) return candidate;
    if (selectedVideo?.uri?.startsWith('data:') || selectedVideo?.uri?.startsWith('blob:')) return 'Selected video';
    return selectedVideo?.uri?.split('/').pop() || 'Selected video';
  };

  const handlePickVideo = async () => {
    try {
      const video = await MediaUploadService.pickVideo();
      if (video) {
        setSelectedVideo(video);
        setThumbnail(null);
        setErrorMessage(null);
        
        // Try to capture thumbnail
        const thumb = await MediaUploadService.captureVideoThumbnail(video.uri);
        if (thumb) {
          setThumbnail(thumb);
        }
        
        setResult(null);
      }
    } catch (error) {
      console.error('Unable to select video:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not select this video.');
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      const fileName = getSelectedFileName();
      
      const processingResult = await MediaUploadService.processVideo(selectedVideo.uri, fileName);
      
      setResult(processingResult);
    } catch (error) {
      console.error('Unable to process selected video:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not process this video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (result?.predictedText) {
      try {
        await Clipboard.setStringAsync(result.predictedText);
        Alert.alert('Copied', 'Text copied to clipboard');
      } catch (error) {
        Alert.alert('Error', 'Failed to copy');
      }
    }
  };

  const handleShare = async () => {
    if (result?.predictedText) {
      try {
        await Share.share({ message: result.predictedText });
      } catch (error) {
        Alert.alert('Error', 'Failed to share');
      }
    }
  };

  const handleSpeak = () => {
    if (result?.predictedText) {
      SpeechService.speak(result.predictedText);
    }
  };

  const handleClear = () => {
    setSelectedVideo(null);
    setThumbnail(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload & Process Video</Text>
      <Text style={styles.prototypeNotice}>Prototype mode: processing shows the next sample sentence and does not upload your video or call an API.</Text>
      
      {/* Video Selection Section */}
      <View style={styles.section}>
        <SimpleButton title={selectedVideo ? 'Choose a different video' : 'Pick Video from Gallery'} onPress={handlePickVideo} disabled={isProcessing} />
        
        {selectedVideo && (
          <View style={styles.videoInfo}>
            <Text style={styles.sectionTitle}>Selected Video</Text>
            {thumbnail && (
              <Image 
                source={{ uri: thumbnail }} 
                style={styles.thumbnail}
              />
            )}
            <Text style={styles.infoText}>{`File: ${getSelectedFileName()}`}</Text>
            <Text style={styles.infoText}>
              {`Duration: ${selectedVideo.duration ? `${(selectedVideo.duration / 1000).toFixed(1)}s` : 'Not available'}`}
            </Text>
            <Text style={styles.infoText}>
              {`Size: ${selectedVideo.fileSize ? `${(selectedVideo.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Not available'}`}
            </Text>
          </View>
        )}
      </View>
      {errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}

      {/* Processing Section */}
      {selectedVideo && !result && (
        <View style={styles.section}>
          <SimpleButton 
            title={isProcessing ? "Processing..." : "Process Video"} 
            onPress={handleProcessVideo}
            disabled={isProcessing}
          />
          {isProcessing && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />}
        </View>
      )}

      {/* Results Section */}
      {result && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recognition Results</Text>
          
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Recognized Text</Text>
            <Text style={styles.resultText}>{result.predictedText || 'No text recognized'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={styles.statValue}>Demo</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Processing Time</Text>
              <Text style={styles.statValue}>{result.processingTime} ms</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <SimpleButton title="Copy" onPress={handleCopy} />
            <View style={{ width: 8 }} />
            <SimpleButton title="Share" onPress={handleShare} />
          </View>

          <View style={{ height: 12 }} />

          <SimpleButton title="Speak" onPress={handleSpeak} />
          <View style={{ height: 12 }} />

          <SimpleButton title="New Video" onPress={handleClear} />
          <View style={{ height: 10 }} />
          <SimpleButton
            title="Open full result"
            onPress={() => navigation.navigate('Results', {
              prediction: {
                predictedText: result.predictedText,
                confidence: result.confidence,
                processingTime: result.processingTime,
                source: result.source,
              },
              recordId: result.recordId,
            })}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 20,
    marginTop: 12
  },
  prototypeNotice: {
    color: '#695c9e',
    backgroundColor: '#f0edff',
    borderRadius: 10,
    padding: 11,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  error: {
    color: '#a32936',
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 11,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12
  },
  videoInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  resultBox: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    lineHeight: 24
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  }
});
