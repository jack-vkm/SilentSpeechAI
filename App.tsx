import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import VideoUploadScreen from './src/screens/VideoUploadScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TextToSpeechScreen from './src/screens/TextToSpeechScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AccountScreen from './src/screens/AccountScreen';
import SplashScreen from './src/screens/SplashScreen';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/store/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { dark } = useTheme();
  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: dark ? '#201f2c' : '#fff' },
          headerTintColor: dark ? '#f1efff' : '#28283a',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: dark ? '#171622' : '#f7f6fc' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SilentVoice AI' }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Recognition' }} />
        <Stack.Screen name="VideoUpload" component={VideoUploadScreen} options={{ title: 'Upload video' }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Recognized result' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} options={{ title: 'Text to speech' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About app' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Welcome to SilentVoice' }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Login / Register' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
