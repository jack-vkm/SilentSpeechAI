import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../store/ThemeContext';

export default function AboutScreen({ navigation }: any) {
  const { dark } = useTheme();
  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <View style={styles.brandMark}><Text style={styles.brandMarkText}>〰</Text></View>
      <Text style={styles.brand}>SilentVoice AI</Text>
      <Text style={styles.version}>Version 1.0.0</Text>
      <Text style={styles.description}>A communication companion that explores silent speech recognition and turns written text into spoken audio.</Text>
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>What you can do</Text>
        <Text style={styles.feature}>•  Record or select a video for recognition</Text>
        <Text style={styles.feature}>•  Review and save recognized results</Text>
        <Text style={styles.feature}>•  Speak text aloud with device voices</Text>
      </View>
      <Text style={styles.notice}>Recognition quality and language availability depend on the configured service and device. Review your organization's privacy policy before processing sensitive recordings.</Text>
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HelpSupport')}><Text style={styles.rowText}>Privacy & data information</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HelpSupport')}><Text style={styles.rowText}>Terms and support</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 22, paddingBottom: 36, maxWidth: 680, width: '100%', alignSelf: 'center', alignItems: 'center' },
  brandMark: { width: 76, height: 76, borderRadius: 28, backgroundColor: '#6847ee', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  brandMarkText: { color: '#fff', fontSize: 38, fontWeight: '800' },
  brand: { color: '#292a3d', fontSize: 23, fontWeight: '800', marginTop: 15 },
  version: { color: '#888899', fontSize: 12, marginTop: 4 },
  description: { color: '#707184', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 18, marginBottom: 20 },
  featureCard: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eeedf4', borderRadius: 16, padding: 17 },
  featureTitle: { color: '#313246', fontWeight: '800', fontSize: 14, marginBottom: 12 },
  feature: { color: '#656679', lineHeight: 23, fontSize: 12 },
  notice: { color: '#858596', fontSize: 11, lineHeight: 17, marginVertical: 18 },
  row: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  rowText: { color: '#414256', fontSize: 13, fontWeight: '600' },
  chevron: { color: '#6847ee', fontSize: 18 },
});
