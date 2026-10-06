import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService, { HistoryRecord } from '../services/StorageService';
import { useTheme } from '../store/ThemeContext';

const purple = '#6847ee';
const PROFILE_KEY = '@sv_profile';

function Tile({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.8} style={[styles.tile, { backgroundColor: color }]}>
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { dark } = useTheme();
  const [recent, setRecent] = useState<HistoryRecord[]>([]);
  const [name, setName] = useState('John Doe');

  useFocusEffect(useCallback(() => {
    let active = true;
    StorageService.list()
      .then(records => { if (active) setRecent(records.slice(0, 3)); })
      .catch(error => console.error('Unable to load recent history:', error));
    AsyncStorage.getItem(PROFILE_KEY)
      .then(stored => {
        if (stored && active) {
          const profile = JSON.parse(stored);
          setName(profile.name || 'John Doe');
        }
      })
      .catch(error => console.error('Unable to load profile name:', error));
    return () => { active = false; };
  }, []));

  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.eyebrow}>SILENTVOICE AI</Text>
          <Text style={styles.greeting}>Hello, {name} 👋</Text>
          <Text style={styles.subheading}>Let’s make communication easier.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile" style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>SILENT SPEECH, UNDERSTOOD</Text>
          <Text style={styles.heroTitle}>Turn your words{'\n'}into a voice.</Text>
          <Text style={styles.heroBody}>Record a short video and let SilentVoice help express what you’re saying.</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.heroButton} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.heroButtonText}>Start recognition  ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroOrb}><Text style={styles.heroOrbText}>〰</Text></View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your tools</Text>
        <Text style={styles.sectionHint}>Choose what you need</Text>
      </View>
      <View style={styles.grid}>
        <Tile icon="◉" label="Start recognition" color="#eee9ff" onPress={() => navigation.navigate('Camera')} />
        <Tile icon="⇧" label="Upload a video" color="#e8f0ff" onPress={() => navigation.navigate('VideoUpload')} />
        <Tile icon="🔊" label="Text to speech" color="#ffeaf1" onPress={() => navigation.navigate('TextToSpeech')} />
        <Tile icon="◷" label="History" color="#e4f7f1" onPress={() => navigation.navigate('History')} />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('History')}>
          <Text style={styles.link}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recentCard}>
        {recent.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyTitle}>Your recent results will appear here</Text>
            <Text style={styles.emptyBody}>Start a recognition to create your first result.</Text>
          </View>
        ) : recent.map((item, index) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={item.id}
            style={[styles.recentRow, index > 0 && styles.divider]}
            onPress={() => navigation.navigate('Results', { prediction: { predictedText: item.text, confidence: 0, processingTime: 0 }, recordId: item.id })}
          >
            <View style={styles.recentIcon}><Text style={styles.recentIconText}>▤</Text></View>
            <View style={styles.recentCopy}>
              <Text style={styles.recentTitle} numberOfLines={1}>{item.text || 'Recognition result'}</Text>
              <Text style={styles.recentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomLinks}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}><Text style={styles.bottomLinkText}>Settings</Text></TouchableOpacity>
        <Text style={styles.bottomDot}>•</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HelpSupport')}><Text style={styles.bottomLinkText}>Help & Support</Text></TouchableOpacity>
        <Text style={styles.bottomDot}>•</Text>
        <TouchableOpacity onPress={() => navigation.navigate('About')}><Text style={styles.bottomLinkText}>About</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 20, paddingBottom: 36, maxWidth: 720, width: '100%', alignSelf: 'center' },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: purple, fontWeight: '800', fontSize: 11, letterSpacing: 1.5, marginBottom: 7 },
  greeting: { color: '#202238', fontSize: 24, fontWeight: '800' },
  subheading: { color: '#77788a', fontSize: 13, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#e6e0ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: purple, fontWeight: '800', fontSize: 15 },
  hero: { backgroundColor: '#28214b', borderRadius: 24, padding: 22, minHeight: 230, flexDirection: 'row', overflow: 'hidden', marginBottom: 28 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: '#bcb0ff', letterSpacing: 1, fontWeight: '700', fontSize: 9 },
  heroTitle: { color: '#fff', fontWeight: '800', fontSize: 25, lineHeight: 31, marginTop: 10 },
  heroBody: { color: '#dad6ec', fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 300 },
  heroButton: { backgroundColor: purple, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, alignSelf: 'flex-start', marginTop: 16 },
  heroButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heroOrb: { width: 98, height: 98, borderRadius: 49, backgroundColor: '#50418c', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginLeft: -14 },
  heroOrbText: { color: '#c3b8ff', fontSize: 44, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { color: '#25263a', fontWeight: '800', fontSize: 17 },
  sectionHint: { color: '#9292a2', fontSize: 11 },
  link: { color: purple, fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 25 },
  tile: { width: '47%', minHeight: 116, borderRadius: 18, padding: 15, margin: '1.5%', justifyContent: 'space-between' },
  tileIcon: { color: purple, fontSize: 26, fontWeight: '700' },
  tileLabel: { color: '#27283b', fontSize: 13, fontWeight: '700' },
  recentCard: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, borderWidth: 1, borderColor: '#eeedf4' },
  emptyRecent: { paddingVertical: 22, alignItems: 'center' },
  emptyTitle: { color: '#3c3d50', fontWeight: '700', fontSize: 13 },
  emptyBody: { color: '#9091a1', fontSize: 12, marginTop: 5, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  divider: { borderTopColor: '#f0eff5', borderTopWidth: 1 },
  recentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#eeeaff', alignItems: 'center', justifyContent: 'center' },
  recentIconText: { color: purple, fontSize: 16, fontWeight: '700' },
  recentCopy: { flex: 1, marginLeft: 11 },
  recentTitle: { color: '#303145', fontWeight: '700', fontSize: 12 },
  recentDate: { color: '#9091a1', fontSize: 11, marginTop: 4 },
  chevron: { color: '#aaa9b6', fontSize: 21, marginLeft: 8 },
  bottomLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 24 },
  bottomLinkText: { color: '#7a7b8d', fontSize: 11, paddingHorizontal: 7 },
  bottomDot: { color: '#c6c5d0' },
});
