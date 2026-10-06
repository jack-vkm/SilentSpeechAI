import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../store/ThemeContext';

const RATE_KEY = '@sv_speech_rate';
const LANGUAGE_KEY = '@sv_speech_language';
const NOTIFICATIONS_KEY = '@sv_notifications';
const rates = [0.75, 1, 1.25];
const languages = [
  { label: 'English (India)', code: 'en-IN' },
  { label: 'English (US)', code: 'en-US' },
  { label: 'Spanish', code: 'es-ES' },
];

export default function SettingsScreen({ navigation }: any) {
  const { dark, toggle } = useTheme();
  const [rate, setRate] = useState(1);
  const [language, setLanguage] = useState('en-IN');
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(RATE_KEY),
      AsyncStorage.getItem(LANGUAGE_KEY),
      AsyncStorage.getItem(NOTIFICATIONS_KEY),
    ]).then(([savedRate, savedLanguage, savedNotifications]) => {
      if (savedRate) setRate(Number(savedRate));
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedNotifications != null) setNotifications(savedNotifications === '1');
    }).catch(error => console.error('Unable to load settings:', error));
  }, []);

  const persist = async (key: string, value: string) => {
    try { await AsyncStorage.setItem(key, value); }
    catch (error) { Alert.alert('Could not save setting', 'Please try again.'); }
  };

  const updateRate = (value: number) => {
    setRate(value);
    void persist(RATE_KEY, String(value));
  };

  const updateLanguage = (value: string) => {
    setLanguage(value);
    void persist(LANGUAGE_KEY, value);
  };

  const updateNotifications = (value: boolean) => {
    setNotifications(value);
    void persist(NOTIFICATIONS_KEY, value ? '1' : '0');
  };

  return (
    <ScrollView style={[styles.screen, dark && styles.darkScreen]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, dark && styles.darkText]}>App settings</Text>
      <View style={[styles.card, dark && styles.darkCard]}>
        <View style={styles.row}>
          <View style={styles.rowCopy}><Text style={[styles.rowTitle, dark && styles.darkMainText]}>Dark theme</Text><Text style={styles.rowHint}>Use a darker app appearance</Text></View>
          <Switch value={dark} onValueChange={toggle} />
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <View style={styles.rowCopy}><Text style={[styles.rowTitle, dark && styles.darkMainText]}>Notifications</Text><Text style={styles.rowHint}>Notification preference for this device</Text></View>
          <Switch value={notifications} onValueChange={updateNotifications} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, dark && styles.darkText]}>Text to speech</Text>
      <View style={[styles.card, dark && styles.darkCard]}>
        <Text style={[styles.label, dark && styles.darkSubText]}>Default voice</Text>
        {languages.map(item => (
          <TouchableOpacity key={item.code} onPress={() => updateLanguage(item.code)} style={styles.choiceRow}>
            <Text style={[styles.choiceText, dark && styles.darkMainText]}>{item.label}</Text><Text style={styles.radio}>{language === item.code ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.separator} />
        <Text style={[styles.label, dark && styles.darkSubText]}>Default speech speed</Text>
        <View style={styles.rateRow}>
          {rates.map(value => (
            <TouchableOpacity key={value} onPress={() => updateRate(value)} style={[styles.rate, rate === value && styles.rateSelected]}>
              <Text style={[styles.rateText, dark && styles.darkMainText, rate === value && styles.rateTextSelected]}>{value}×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionTitle, dark && styles.darkText]}>Account</Text>
      <View style={[styles.card, dark && styles.darkCard]}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Profile')}><Text style={[styles.choiceText, dark && styles.darkMainText]}>Edit profile</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('History')}><Text style={[styles.choiceText, dark && styles.darkMainText]}>Manage history</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, dark && styles.darkText]}>About</Text>
      <View style={[styles.card, dark && styles.darkCard]}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Onboarding')}><Text style={[styles.choiceText, dark && styles.darkMainText]}>Take the app tour</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('HelpSupport')}><Text style={[styles.choiceText, dark && styles.darkMainText]}>Help & Support</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('About')}><Text style={[styles.choiceText, dark && styles.darkMainText]}>About SilentVoice AI</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
      </View>
      <Text style={styles.version}>SilentVoice AI · Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  darkScreen: { backgroundColor: '#171622' },
  darkCard: { backgroundColor: '#242331', borderColor: '#363544' },
  content: { padding: 18, paddingBottom: 34, maxWidth: 680, width: '100%', alignSelf: 'center' },
  sectionTitle: { color: '#353649', fontWeight: '800', fontSize: 14, marginTop: 15, marginBottom: 9 },
  darkText: { color: '#f0eefb' },
  darkMainText: { color: '#f0eefb' },
  darkSubText: { color: '#b9b7c8' },
  card: { backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 14, borderColor: '#eeedf4', borderWidth: 1 },
  row: { minHeight: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCopy: { flex: 1, paddingRight: 10 },
  rowTitle: { color: '#36374a', fontWeight: '700', fontSize: 13 },
  rowHint: { color: '#8b8b9b', fontSize: 11, marginTop: 4 },
  separator: { height: 1, backgroundColor: '#f0eff5', marginVertical: 3 },
  label: { color: '#818192', fontWeight: '700', fontSize: 11, marginTop: 12, marginBottom: 8 },
  choiceRow: { minHeight: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  choiceText: { color: '#45465a', fontSize: 13, fontWeight: '600' },
  radio: { color: '#6847ee', fontSize: 16 },
  rateRow: { flexDirection: 'row', gap: 8, marginBottom: 13 },
  rate: { flex: 1, backgroundColor: '#f6f5fa', borderRadius: 10, alignItems: 'center', paddingVertical: 10 },
  rateSelected: { backgroundColor: '#eeeaff' },
  rateText: { color: '#68697a', fontSize: 12, fontWeight: '700' },
  rateTextSelected: { color: '#6847ee' },
  linkRow: { minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#f0eff5', borderBottomWidth: 1 },
  arrow: { color: '#9897a6', fontSize: 20 },
  version: { color: '#9291a1', fontSize: 11, textAlign: 'center', marginTop: 20 },
});
