import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { CameraRecorderHandle, CameraRecorderProps } from './CameraRecorder.types';

const CameraRecorder = forwardRef<CameraRecorderHandle, CameraRecorderProps>(
  ({ onReady, onError, onRecordingComplete, onRecordingChange }, ref) => {
    const cameraRef = useRef<Camera | null>(null);
    const cameraReady = useRef(false);

    useImperativeHandle(ref, () => ({
      async startRecording() {
        if (!cameraReady.current || !cameraRef.current) {
          throw new Error('Camera is not ready yet.');
        }
        onRecordingChange(true);
        try {
          const result = await cameraRef.current.recordAsync({
            maxDuration: 8,
            quality: '480p',
            mute: true,
          });
          if (!result?.uri) throw new Error('The camera did not produce a video file.');
          onRecordingComplete(result.uri);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Video recording failed.';
          onError(message);
        } finally {
          onRecordingChange(false);
        }
      },
      stopRecording() {
        cameraRef.current?.stopRecording();
      },
    }), [onError, onRecordingChange, onRecordingComplete]);

    return (
      <Camera
        ref={cameraRef}
        style={styles.preview}
        type={CameraType.front}
        onCameraReady={() => {
          cameraReady.current = true;
          onReady();
        }}
        onMountError={event => onError(event.message)}
      />
    );
  }
);

CameraRecorder.displayName = 'CameraRecorder';

export default CameraRecorder;

const styles = StyleSheet.create({
  preview: { flex: 1, backgroundColor: '#000' },
});
