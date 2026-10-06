import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import StorageService from '../services/StorageService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../store/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { dark } = useTheme();
  const { prediction, recordId } = route.params;
  const [text, setText] = useState(prediction.predictedText || '');
  const [savedRecordId, setSavedRecordId] = useState(recordId);
  const saved = Boolean(savedRecordId);
  const [speaking, setSpeaking] = useState(false);

  const copy = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      Alert.alert('Copied', 'Text copied to clipboard.');
    } catch (error) {
      console.error('Unable to copy result:', error);
      Alert.alert('Copy failed', 'The result could not be copied.');
    }
  };

  const share = async () => {
    try { await Share.share({ message: text }); }
    catch (error) {
      console.error('Unable to share result:', error);
      Alert.alert('Share failed', 'The result could not be shared.');
    }
  };

  const save = async () => {
    if (!text.trim()) {
      Alert.alert('Nothing to save', 'There is no recognized text to save.');
      return;
    }
    try {
      const record = { id: savedRecordId || String(Date.now()), text: text.trim(), createdAt: Date.now() };
      if (savedRecordId) await StorageService.update(record);
      else {
        await StorageService.save(record);
        setSavedRecordId(record.id);
      }
      Alert.alert(savedRecordId ? 'Changes saved' : 'Saved', 'This result is now available in History.');
    } catch (error) {
      console.error('Unable to save result:', error);
      Alert.alert('Save failed', 'The result could not be saved.');
    }
  };

  const speak = () => {
    if (!text.trim()) return;
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      rate: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false);
        Alert.alert('Speech unavailable', 'Text-to-speech could not be started.');
      },
    });
  };

  const confidence = Number(prediction.confidence || 0);

  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <View style={styles.preview}>
        <Text style={styles.previewMark}>◉</Text>
        <Text style={styles.previewHint}>Recognition complete</Text>
      </View>
      <View style={styles.resultCard}>
        <View style={styles.resultHeading}>
          <Text style={styles.title}>Recognized text</Text>
          {saved && <Text style={styles.savedBadge}>SAVED</Text>}
        </View>
        <TextInput
          accessibilityLabel="Edit recognized text"
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          style={styles.resultInput}
        />
        {prediction.source === 'demo' ? (
          <Text style={styles.demoNote}>Prototype result · no API request was made</Text>
        ) : (
          <View style={styles.metrics}>
            <Text style={styles.metric}>Confidence: {confidence ? `${(confidence * (confidence <= 1 ? 100 : 1)).toFixed(0)}%` : '—'}</Text>
            <Text style={styles.metric}>Processed in {prediction.processingTime || 0} ms</Text>
          </View>
        )}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity accessibilityRole="button" onPress={copy} style={styles.action}><Text style={styles.actionIcon}>▢</Text><Text style={styles.actionText}>Copy</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={speak} style={styles.action}><Text style={styles.actionIcon}>{speaking ? '■' : '◖'}</Text><Text style={styles.actionText}>{speaking ? 'Stop' : 'Speak'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={share} style={styles.action}><Text style={styles.actionIcon}>↗</Text><Text style={styles.actionText}>Share</Text></TouchableOpacity>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={save} style={styles.primary}><Text style={styles.primaryText}>{saved ? 'Save changes' : 'Save to history'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Camera')} style={styles.secondary}><Text style={styles.secondaryText}>Start another recognition</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('History')} style={styles.historyLink}><Text style={styles.historyText}>Open history</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 18, paddingBottom: 32, maxWidth: 680, width: '100%', alignSelf: 'center' },
  preview: { height: 185, borderRadius: 20, backgroundColor: '#e7e5f2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  previewMark: { color: '#6847ee', fontSize: 45 },
  previewHint: { color: '#696a7d', fontSize: 12, marginTop: 6 },
  resultCard: { backgroundColor: '#fff', padding: 16, borderRadius: 17, borderWidth: 1, borderColor: '#eeedf4' },
  resultHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { color: '#28293c', fontWeight: '800', fontSize: 15 },
  savedBadge: { color: '#3a9878', backgroundColor: '#e5f7f0', overflow: 'hidden', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '800' },
  resultInput: { minHeight: 110, borderWidth: 1, borderColor: '#ebe9f1', borderRadius: 12, padding: 12, color: '#333447', fontSize: 15, lineHeight: 22 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11 },
  metric: { color: '#858596', fontSize: 10 },
  demoNote: { color: '#858596', fontSize: 10, marginTop: 11 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: { flex: 1, backgroundColor: '#fff', borderColor: '#eeedf4', borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  actionIcon: { color: '#6847ee', fontSize: 19, fontWeight: '700' },
  actionText: { color: '#444558', fontSize: 11, fontWeight: '700', marginTop: 3 },
  primary: { backgroundColor: '#6847ee', borderRadius: 13, alignItems: 'center', padding: 14, marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondary: { backgroundColor: '#fff', borderColor: '#e7e5ef', borderWidth: 1, borderRadius: 13, alignItems: 'center', padding: 14, marginTop: 10 },
  secondaryText: { color: '#4c4d60', fontWeight: '700' },
  historyLink: { alignItems: 'center', padding: 13 },
  historyText: { color: '#6847ee', fontWeight: '700', fontSize: 12 },
});
