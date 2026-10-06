import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'expo-camera';
import { ResizeMode, Video } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import CameraRecorder from '../components/CameraRecorder';
import { CameraRecorderHandle } from '../components/CameraRecorder.types';
import LoadingIndicator from '../components/LoadingIndicator';
import DemoRecognitionService from '../services/DemoRecognitionService';

export default function CameraScreen({ navigation }: any) {
  const recorderRef = useRef<CameraRecorderHandle | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(Platform.OS === 'web' ? true : null);
  const [cameraReady, setCameraReady] = useState(false);
  const [focused, setFocused] = useState(true);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const onCameraReady = useCallback(() => {
    setCameraError(null);
    setCameraReady(true);
  }, []);

  const onCameraError = useCallback((message: string) => {
    setCameraReady(false);
    setCameraError(message);
    setRecording(false);
  }, []);

  const onRecordingComplete = useCallback((uri: string) => {
    setVideoUri(uri);
    setCameraError(null);
  }, []);

  const onRecordingChange = useCallback((value: boolean) => {
    setRecording(value);
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setHasPermission(true);
      return;
    }
    try {
      const response = await Camera.requestCameraPermissionsAsync();
      setHasPermission(response.granted);
      if (!response.granted) {
        setCameraError('Camera access is required to record a video. Allow camera access in your device settings, then try again.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Camera permission could not be requested.';
      setCameraError(message);
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') void requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    return () => {
      if (videoUri?.startsWith('blob:')) URL.revokeObjectURL(videoUri);
    };
  }, [videoUri]);

  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => {
      setFocused(false);
      recorderRef.current?.stopRecording();
      setRecording(false);
      setCameraReady(false);
    };
  }, []));

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stopRecording();
      return;
    }
    if (!cameraReady) {
      setCameraError('The camera is still starting. Wait for the live preview before recording.');
      return;
    }
    setCameraError(null);
    try {
      await recorderRef.current?.startRecording();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video recording failed.';
      setCameraError(message);
      setRecording(false);
    }
  };

  const processVideo = async () => {
    if (!videoUri) return;
    setLoading(true);
    setCameraError(null);
    try {
      const prediction = await DemoRecognitionService.analyzeRecording();
      navigation.replace('Results', { prediction });
    } catch (error) {
      console.error('Unable to process camera recording:', error);
      setCameraError(error instanceof Error ? error.message : 'The video could not be processed.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setVideoUri(null);
    setCameraReady(false);
    setCameraError(null);
  };

  if (hasPermission === null) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      {hasPermission === false ? (
        <View style={styles.permissionPanel}>
          <Text style={styles.panelTitle}>Camera access is off</Text>
          <Text style={styles.panelBody}>{cameraError || 'Allow camera access to record a silent-speech clip.'}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => void requestPermission()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Allow camera access</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.preview}>
            {videoUri ? (
              <Video source={{ uri: videoUri }} style={styles.video} useNativeControls resizeMode={ResizeMode.CONTAIN} />
            ) : focused ? (
              <>
                <CameraRecorder
                  ref={recorderRef}
                  onReady={onCameraReady}
                  onError={onCameraError}
                  onRecordingComplete={onRecordingComplete}
                  onRecordingChange={onRecordingChange}
                />
                {!cameraReady && !cameraError && (
                  <View style={styles.previewOverlay}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.previewStatus}>Starting camera...</Text>
                  </View>
                )}
              </>
            ) : null}
          </View>

          <Text style={styles.hint}>Prototype mode: each recording displays the next sample sentence. No video is uploaded or AI API called.</Text>
          {cameraError && <Text accessibilityRole="alert" style={styles.error}>{cameraError}</Text>}

          <View style={styles.controls}>
            {!videoUri ? (
              <TouchableOpacity accessibilityRole="button" onPress={() => void toggleRecording()} disabled={!cameraReady && !recording || loading} style={[styles.primaryButton, recording && styles.stopButton, (!cameraReady && !recording || loading) && styles.disabled]}>
                <Text style={styles.primaryText}>{recording ? 'Stop recording' : cameraReady ? 'Start recording' : 'Waiting for camera'}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity accessibilityRole="button" onPress={() => void processVideo()} disabled={loading} style={[styles.primaryButton, loading && styles.disabled]}>
                  <Text style={styles.primaryText}>{loading ? 'Processing...' : 'Use this recording'}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={retake} disabled={loading} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Record again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          {loading && <LoadingIndicator />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f7f6fc' },
  preview: { flex: 1, minHeight: 280, borderRadius: 18, overflow: 'hidden', backgroundColor: '#171622' },
  video: { width: '100%', height: '100%' },
  previewOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,22,34,0.58)' },
  previewStatus: { color: '#fff', fontSize: 12, marginTop: 8 },
  hint: { color: '#737487', fontSize: 12, textAlign: 'center', lineHeight: 18, marginVertical: 12 },
  error: { color: '#b42332', backgroundColor: '#fff0f0', padding: 11, borderRadius: 10, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  controls: { gap: 10, alignItems: 'stretch' },
  primaryButton: { backgroundColor: '#6847ee', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 13, alignItems: 'center' },
  stopButton: { backgroundColor: '#e74450' },
  disabled: { opacity: 0.55 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e3ef', paddingVertical: 13, borderRadius: 13, alignItems: 'center' },
  secondaryText: { color: '#494a5e', fontWeight: '700', fontSize: 13 },
  permissionPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  panelTitle: { color: '#292a3d', fontWeight: '800', fontSize: 18, marginBottom: 8 },
  panelBody: { color: '#77788a', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 18 },
});
