import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechService from '../services/SpeechService';
import * as Speech from 'expo-speech';
import { useTheme } from '../store/ThemeContext';

const RATE_KEY = '@sv_speech_rate';
const LANGUAGE_KEY = '@sv_speech_language';
const rates = [0.75, 1, 1.25];
const languages = [
  { label: 'English (India)', code: 'en-IN' },
  { label: 'English (US)', code: 'en-US' },
  { label: 'Spanish', code: 'es-ES' },
];

export default function TextToSpeechScreen() {
  const { dark } = useTheme();
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [language, setLanguage] = useState('en-IN');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(RATE_KEY), AsyncStorage.getItem(LANGUAGE_KEY)])
      .then(([savedRate, savedLanguage]) => {
        if (savedRate) setRate(Number(savedRate));
        if (savedLanguage) setLanguage(savedLanguage);
      })
      .catch(error => console.error('Unable to load speech preferences:', error));
    return () => SpeechService.stop();
  }, []);

  const play = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Add some text', 'Enter the text you want SilentVoice to speak.');
      return;
    }
    if (speaking) {
      SpeechService.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(trimmed, {
      rate,
      language,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: error => {
        console.error('Unable to start text-to-speech:', error);
        setSpeaking(false);
        Alert.alert('Unable to speak', 'Text-to-speech could not be started on this device.');
      },
    });
  };

  const chooseRate = async (value: number) => {
    setRate(value);
    try { await AsyncStorage.setItem(RATE_KEY, String(value)); }
    catch (error) { Alert.alert('Could not save setting', 'Speech speed was not saved.'); }
  };

  const chooseLanguage = async (value: string) => {
    setLanguage(value);
    try { await AsyncStorage.setItem(LANGUAGE_KEY, value); }
    catch (error) { Alert.alert('Could not save setting', 'Language was not saved.'); }
  };

  const selectedLanguage = languages.find(item => item.code === language) || languages[0];

  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>Type or paste a message and have it spoken aloud.</Text>
      <View style={styles.editor}>
        <TextInput
          accessibilityLabel="Text to speak"
          multiline
          maxLength={500}
          value={text}
          onChangeText={setText}
          placeholder="Write something to say..."
          placeholderTextColor="#9a98a8"
          textAlignVertical="top"
          style={styles.input}
        />
        <Text style={styles.count}>{text.length}/500</Text>
      </View>
      <Text style={styles.label}>Voice</Text>
      <View style={styles.options}>
        {languages.map(item => (
          <TouchableOpacity key={item.code} onPress={() => chooseLanguage(item.code)} style={[styles.option, language === item.code && styles.optionSelected]}>
            <Text style={[styles.optionText, language === item.code && styles.optionTextSelected]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Speech speed</Text>
      <View style={styles.rateRow}>
        {rates.map(value => (
          <TouchableOpacity key={value} onPress={() => chooseRate(value)} style={[styles.rate, rate === value && styles.rateSelected]}>
            <Text style={[styles.rateText, rate === value && styles.optionTextSelected]}>{value}×</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={play} style={styles.playButton}>
        <Text style={styles.playButtonText}>{speaking ? '■  Stop speaking' : '▶  Play voice'}</Text>
      </TouchableOpacity>
      <Text style={styles.footnote}>Voice: {selectedLanguage.label} · Speech stays on your device.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 20, paddingBottom: 32, maxWidth: 680, width: '100%', alignSelf: 'center' },
  intro: { color: '#737487', fontSize: 14, marginBottom: 16 },
  editor: { backgroundColor: '#fff', borderColor: '#e8e5f2', borderWidth: 1, borderRadius: 16, padding: 14, minHeight: 190 },
  input: { minHeight: 145, color: '#292a3d', fontSize: 16, lineHeight: 23 },
  count: { alignSelf: 'flex-end', color: '#9392a2', fontSize: 11 },
  label: { color: '#333448', fontSize: 14, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  options: { gap: 8 },
  option: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderColor: '#e8e5f2', borderWidth: 1 },
  optionSelected: { backgroundColor: '#f0edff', borderColor: '#7960ed' },
  optionText: { color: '#55566a', fontWeight: '600', fontSize: 13 },
  optionTextSelected: { color: '#6245e4' },
  rateRow: { flexDirection: 'row', gap: 10 },
  rate: { flex: 1, backgroundColor: '#fff', borderColor: '#e8e5f2', borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  rateSelected: { backgroundColor: '#f0edff', borderColor: '#7960ed' },
  rateText: { color: '#55566a', fontWeight: '700' },
  playButton: { marginTop: 24, padding: 15, borderRadius: 14, alignItems: 'center', backgroundColor: '#6847ee' },
  playButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  footnote: { color: '#8d8c9c', textAlign: 'center', marginTop: 13, fontSize: 11 },
});
