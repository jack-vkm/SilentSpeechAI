export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Camera: undefined;
  VideoUpload: undefined;
  Results: {
    prediction: {
      predictedText?: string;
      confidence?: number;
      processingTime?: number;
      source?: 'demo' | 'api';
    };
    recordId?: string;
  };
  History: undefined;
  Settings: undefined;
  TextToSpeech: undefined;
  Profile: undefined;
  HelpSupport: undefined;
  About: undefined;
  Onboarding: undefined;
  Account: undefined;
};
