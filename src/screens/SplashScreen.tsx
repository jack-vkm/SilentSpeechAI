import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SplashScreen({ navigation }: any) {
  return (
    <View style={styles.screen}>
      <View style={styles.brandIcon}><Text style={styles.wave}>〰</Text></View>
      <Text style={styles.title}>SilentVoice AI</Text>
      <Text style={styles.tagline}>Speak without sound.</Text>
      <Text style={styles.description}>A new way to make silent communication heard.</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Onboarding')} style={styles.primary}>
        <Text style={styles.primaryText}>Get started</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.replace('Home')} style={styles.guest}>
        <Text style={styles.guestText}>Explore as guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbfaff', alignItems: 'center', justifyContent: 'center', padding: 28 },
  brandIcon: { width: 104, height: 104, borderRadius: 36, backgroundColor: '#6847ee', alignItems: 'center', justifyContent: 'center', shadowColor: '#6847ee', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  wave: { color: '#fff', fontSize: 48, fontWeight: '800' },
  title: { color: '#28283a', fontSize: 30, fontWeight: '800', marginTop: 20 },
  tagline: { color: '#6847ee', fontSize: 15, fontWeight: '700', marginTop: 5 },
  description: { color: '#858596', fontSize: 13, marginTop: 12, textAlign: 'center', maxWidth: 280 },
  primary: { backgroundColor: '#6847ee', paddingVertical: 14, borderRadius: 14, alignItems: 'center', width: '100%', maxWidth: 360, marginTop: 40 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  guest: { padding: 13, marginTop: 6 },
  guestText: { color: '#77788a', fontWeight: '700', fontSize: 12 },
});
