import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../services/StorageService';
import { useTheme } from '../store/ThemeContext';

const PROFILE_KEY = '@sv_profile';

export default function ProfileScreen({ navigation }: any) {
  const { dark } = useTheme();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(PROFILE_KEY), StorageService.list()])
      .then(([stored, records]) => {
        if (stored) {
          const profile = JSON.parse(stored);
          setName(profile.name || 'John Doe');
          setEmail(profile.email || 'john@example.com');
        }
        setTotal(records.length);
      })
      .catch(error => console.error('Unable to load profile:', error));
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter a name before saving your profile.');
      return;
    }
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ name: name.trim(), email: email.trim() }));
      Alert.alert('Profile saved', 'Your profile details are stored on this device.');
    } catch (error) {
      Alert.alert('Could not save profile', 'Please try again.');
    }
  };

  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
        <Text style={styles.displayName}>{name || 'Your name'}</Text>
        <Text style={styles.displayEmail}>{email || 'Add an email address'}</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.stat}><Text style={styles.statValue}>{total}</Text><Text style={styles.statLabel}>Recordings</Text></View>
        <View style={styles.statSeparator} />
        <View style={styles.stat}><Text style={styles.statValue}>{total}</Text><Text style={styles.statLabel}>Saved results</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Profile details</Text>
      <Text style={styles.label}>Display name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" />
      <Text style={styles.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity accessibilityRole="button" onPress={saveProfile} style={styles.saveButton}><Text style={styles.saveText}>Save profile</Text></TouchableOpacity>
      <Text style={styles.localNote}>Profile details are saved locally on this device. No account service is configured.</Text>
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('History')}><Text style={styles.linkText}>My history</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Settings')}><Text style={styles.linkText}>App settings</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Account')}><Text style={styles.linkText}>Login / Register</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 20, paddingBottom: 36, maxWidth: 680, width: '100%', alignSelf: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 18 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#e5e0ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#6847ee', fontWeight: '800', fontSize: 22 },
  displayName: { color: '#292a3d', fontWeight: '800', fontSize: 20, marginTop: 10 },
  displayEmail: { color: '#888899', marginTop: 4, fontSize: 13 },
  statCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 17, borderColor: '#eeedf4', borderWidth: 1, marginBottom: 24 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#292a3d', fontWeight: '800', fontSize: 20 },
  statLabel: { color: '#888899', fontSize: 11, marginTop: 4 },
  statSeparator: { width: 1, backgroundColor: '#eeedf4' },
  sectionTitle: { color: '#292a3d', fontSize: 16, fontWeight: '800', marginBottom: 15 },
  label: { color: '#55566a', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#e5e3ec', backgroundColor: '#fff', borderRadius: 12, padding: 13, marginBottom: 15, color: '#292a3d' },
  saveButton: { alignItems: 'center', backgroundColor: '#6847ee', borderRadius: 12, padding: 14 },
  saveText: { color: '#fff', fontWeight: '800' },
  localNote: { color: '#9291a1', fontSize: 11, lineHeight: 16, marginTop: 10, marginBottom: 18 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#ebe9f1' },
  linkText: { color: '#36374a', fontWeight: '600' },
  chevron: { color: '#9897a6', fontSize: 20 },
});
