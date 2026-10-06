export type CameraRecorderHandle = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
};

export type CameraRecorderProps = {
  onReady: () => void;
  onError: (message: string) => void;
  onRecordingComplete: (uri: string) => void;
  onRecordingChange: (recording: boolean) => void;
};
