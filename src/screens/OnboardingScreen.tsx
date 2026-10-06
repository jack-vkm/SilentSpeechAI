import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const pages = [
  { icon: '◉', title: 'Turn silent speech into text', body: 'Record a short video and explore how AI can interpret visible speech.' },
  { icon: '◆', title: 'Your privacy matters', body: 'Your saved recognition results stay on this device. Processing uses the AI service configured for this app.' },
  { icon: '🔊', title: 'Communicate your way', body: 'Review results, keep useful phrases in history, or have typed text spoken aloud.' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const finish = () => navigation.navigate('Account');

  return (
    <View style={styles.screen}>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Home')} style={styles.skip}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>
      <View style={styles.illustration}><Text style={styles.icon}>{page.icon}</Text></View>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.body}>{page.body}</Text>
      <View style={styles.dots}>{pages.map((_, dot) => <View key={dot} style={[styles.dot, index === dot && styles.activeDot]} />)}</View>
      <View style={styles.actions}>
        {index > 0 && <TouchableOpacity onPress={() => setIndex(index - 1)} style={styles.back}><Text style={styles.backText}>Back</Text></TouchableOpacity>}
        <TouchableOpacity accessibilityRole="button" onPress={() => index < pages.length - 1 ? setIndex(index + 1) : finish()} style={styles.next}>
          <Text style={styles.nextText}>{index < pages.length - 1 ? 'Next' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 28 },
  skip: { position: 'absolute', top: 20, right: 22, padding: 10 },
  skipText: { color: '#77788a', fontWeight: '700' },
  illustration: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#f0edff', alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  icon: { color: '#6847ee', fontSize: 68, fontWeight: '800' },
  title: { color: '#292a3d', fontWeight: '800', fontSize: 25, textAlign: 'center', maxWidth: 350 },
  body: { color: '#77788a', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 350, marginTop: 12 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 30, marginBottom: 30 },
  dot: { width: 8, height: 8, backgroundColor: '#ddd9ec', borderRadius: 4 },
  activeDot: { width: 22, backgroundColor: '#6847ee' },
  actions: { width: '100%', maxWidth: 400, flexDirection: 'row', gap: 12 },
  back: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#f1eff7', borderRadius: 12 },
  backText: { color: '#55566a', fontWeight: '700' },
  next: { flex: 2, padding: 14, alignItems: 'center', backgroundColor: '#6847ee', borderRadius: 12 },
  nextText: { color: '#fff', fontWeight: '800' },
});
