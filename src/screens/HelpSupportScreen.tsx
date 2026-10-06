import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../store/ThemeContext';

const faqs = [
  { question: 'How do I use silent speech recognition?', answer: 'Choose Start recognition, allow camera access, record a short video with your face in view, then tap Process video.' },
  { question: 'How can I get better recognition?', answer: 'Use even lighting, keep your face centered, make mouth movements clearly, and record a short clip without camera movement.' },
  { question: 'Which languages are supported?', answer: 'Text-to-speech voices depend on the voices installed on your device. Recognition capabilities depend on the configured AI service.' },
  { question: 'Where are my saved results stored?', answer: 'History is stored locally on this device. Clearing app storage or uninstalling the app may remove saved results.' },
  { question: 'Is my video uploaded?', answer: 'Recognition processing uses the AI service configured by the app. Review your deployment configuration and privacy policy before using sensitive recordings.' },
];

export default function HelpSupportScreen({ navigation }: any) {
  const { dark } = useTheme();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const results = faqs.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <ScrollView style={[styles.screen, dark && styles.screenDark]} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>Find answers about recognition, saved results, and app settings.</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search for help..." style={styles.search} />
      <Text style={styles.sectionTitle}>Frequently asked questions</Text>
      {results.length === 0 ? <Text style={styles.empty}>No help articles match that search.</Text> : results.map(item => {
        const index = faqs.indexOf(item);
        const expanded = open === index;
        return (
          <View key={item.question} style={styles.faq}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setOpen(expanded ? null : index)} style={styles.questionRow}>
              <Text style={styles.question}>{item.question}</Text><Text style={styles.chevron}>{expanded ? '−' : '+'}</Text>
            </TouchableOpacity>
            {expanded && <Text style={styles.answer}>{item.answer}</Text>}
          </View>
        );
      })}
      <Text style={styles.sectionTitle}>More help</Text>
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('About')}><Text style={styles.linkText}>About SilentVoice AI</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Support contact unavailable', 'Add your support email address to the app configuration to enable this option.')}><Text style={styles.linkText}>Email support</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc' },
  screenDark: { backgroundColor: '#171622' },
  content: { padding: 20, paddingBottom: 36, maxWidth: 680, width: '100%', alignSelf: 'center' },
  intro: { color: '#77788a', fontSize: 13, lineHeight: 19, marginBottom: 15 },
  search: { borderWidth: 1, borderColor: '#e8e5f2', borderRadius: 12, padding: 13, backgroundColor: '#fff', marginBottom: 22 },
  sectionTitle: { color: '#292a3d', fontWeight: '800', fontSize: 16, marginBottom: 12, marginTop: 4 },
  faq: { backgroundColor: '#fff', borderRadius: 13, paddingHorizontal: 14, marginBottom: 9, borderWidth: 1, borderColor: '#eeedf4' },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  question: { flex: 1, color: '#3a3b4e', fontWeight: '700', fontSize: 13, paddingRight: 10 },
  chevron: { color: '#6847ee', fontSize: 19 },
  answer: { color: '#737487', fontSize: 12, lineHeight: 18, paddingBottom: 14 },
  empty: { color: '#888899', paddingVertical: 20 },
  linkRow: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 8 },
  linkText: { color: '#414256', fontSize: 13, fontWeight: '600' },
});
