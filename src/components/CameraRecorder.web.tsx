import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraRecorderHandle, CameraRecorderProps } from './CameraRecorder.types';

const PREVIEW_ID = 'silentvoice-web-camera-preview';
const MAX_RECORDING_MS = 8000;

const CameraRecorder = forwardRef<CameraRecorderHandle, CameraRecorderProps>(
  ({ onReady, onError, onRecordingComplete, onRecordingChange }, ref) => {
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
      let mounted = true;
      let video: HTMLVideoElement | null = null;
      const attachCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          onError('This browser cannot access a camera. Try a current browser over HTTPS or localhost.');
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: 'user' },
          });
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          streamRef.current = stream;
          const container = document.getElementById(PREVIEW_ID);
          if (!container) throw new Error('Camera preview could not be initialized.');
          video = document.createElement('video');
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true;
          video.setAttribute('aria-label', 'Front camera preview');
          Object.assign(video.style, { width: '100%', height: '100%', objectFit: 'cover' });
          video.srcObject = stream;
          container.replaceChildren(video);
          await video.play();
          if (mounted) onReady();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not start the camera.';
          onError(message);
        }
      };

      void attachCamera();
      return () => {
        mounted = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (video) video.srcObject = null;
      };
    }, [onError, onReady]);

    useImperativeHandle(ref, () => ({
      async startRecording() {
        const stream = streamRef.current;
        if (!stream) throw new Error('Camera is not ready yet.');
        if (typeof MediaRecorder === 'undefined') {
          throw new Error('This browser does not support video recording. Try a current version of Chrome, Edge, or Firefox.');
        }
        if (recorderRef.current?.state === 'recording') return;

        const mimeType = ['video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
        if (!mimeType) throw new Error('This browser does not support a video format required for recording.');
        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = event => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onerror = () => {
          onRecordingChange(false);
          onError('The browser could not record this video.');
        };
        recorder.onstop = () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = null;
          onRecordingChange(false);
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
          if (blob.size === 0) {
            onError('The recording was empty. Please try again.');
            return;
          }
          objectUrlRef.current = URL.createObjectURL(blob);
          onRecordingComplete(objectUrlRef.current);
        };
        recorder.start(250);
        onRecordingChange(true);
        timerRef.current = setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, MAX_RECORDING_MS);
      },
      stopRecording() {
        const recorder = recorderRef.current;
        if (recorder?.state === 'recording') recorder.stop();
      },
    }), [onError, onRecordingChange, onRecordingComplete]);

    return <View nativeID={PREVIEW_ID} style={styles.preview} />;
  }
);

CameraRecorder.displayName = 'CameraRecorder';

export default CameraRecorder;

const styles = StyleSheet.create({
  preview: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
});
