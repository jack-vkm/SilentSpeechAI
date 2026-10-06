import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StorageService, { HistoryRecord } from '../services/StorageService';
import { useTheme } from '../store/ThemeContext';

export default function HistoryScreen({ navigation }: any) {
  const { dark } = useTheme();
  const [items, setItems] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Today' | 'This week'>('All');
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await StorageService.list());
      setLoadError(false);
    } catch (error) {
      console.error('Unable to load history:', error);
      setLoadError(true);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refresh();
  }, [refresh]));

  const remove = async (id: string) => {
    try {
      await StorageService.remove(id);
      await refresh();
    } catch (error) {
      console.error('Unable to delete history result:', error);
      Alert.alert('Delete failed', 'This result could not be deleted.');
    }
  };

  const clear = () => Alert.alert('Clear history?', 'This permanently removes all saved results from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear all', style: 'destructive', onPress: async () => {
      try {
        await StorageService.clear();
        setItems([]);
      } catch (error) {
        console.error('Unable to clear history:', error);
        Alert.alert('Clear failed', 'History could not be cleared.');
      }
    } },
  ]);

  const now = Date.now();
  const filtered = items.filter(item => {
    const matchesQuery = item.text.toLowerCase().includes(query.toLowerCase());
    const age = now - item.createdAt;
    const matchesFilter = filter === 'All' || (filter === 'Today'
      ? new Date(item.createdAt).toDateString() === new Date(now).toDateString()
      : age <= 7 * 24 * 60 * 60 * 1000);
    return matchesQuery && matchesFilter;
  });

  return (
    <View style={[styles.screen, dark && styles.screenDark]}>
      <Text style={styles.intro}>Search and revisit results saved on this device.</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search history..." style={styles.search} />
      <View style={styles.filters}>
        {(['All', 'Today', 'This week'] as const).map(item => (
          <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterSelected]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextSelected]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loadError ? (
        <View style={styles.empty}><Text style={styles.emptyTitle}>History couldn’t be loaded</Text><TouchableOpacity onPress={() => void refresh()}><Text style={styles.retry}>Try again</Text></TouchableOpacity></View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◷</Text>
          <Text style={styles.emptyTitle}>{items.length ? 'No matching results' : 'No saved results yet'}</Text>
          <Text style={styles.emptyBody}>{items.length ? 'Try a different search or time filter.' : 'Save a recognition result and it will appear here.'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.resultContent}
                onPress={() => navigation.navigate('Results', { prediction: { predictedText: item.text, confidence: 0, processingTime: 0 }, recordId: item.id })}
              >
                <View style={styles.resultIcon}><Text style={styles.resultIconText}>▤</Text></View>
                <View style={styles.copy}>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                  <Text style={styles.resultText} numberOfLines={2}>{item.text || 'Empty result'}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => remove(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {items.length > 0 && <TouchableOpacity accessibilityRole="button" onPress={clear} style={styles.clearButton}><Text style={styles.clearText}>Clear all history</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f6fc', padding: 18, maxWidth: 720, width: '100%', alignSelf: 'center' },
  screenDark: { backgroundColor: '#171622' },
  intro: { color: '#77788a', fontSize: 12, marginBottom: 12 },
  search: { backgroundColor: '#fff', borderColor: '#e8e5f2', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filter: { borderRadius: 30, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#eeedf4' },
  filterSelected: { backgroundColor: '#6847ee' },
  filterText: { color: '#717184', fontSize: 11, fontWeight: '700' },
  filterTextSelected: { color: '#fff' },
  list: { paddingBottom: 14 },
  card: { backgroundColor: '#fff', borderColor: '#eeedf4', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  resultContent: { flexDirection: 'row', alignItems: 'center' },
  resultIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eeeaff', alignItems: 'center', justifyContent: 'center' },
  resultIconText: { color: '#6847ee', fontSize: 16 },
  copy: { flex: 1, marginHorizontal: 11 },
  date: { color: '#9291a1', fontSize: 10, marginBottom: 5 },
  resultText: { color: '#343548', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  chevron: { color: '#a2a1af', fontSize: 21 },
  deleteButton: { alignSelf: 'flex-end', padding: 7, marginTop: 5 },
  deleteText: { color: '#df4c54', fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { color: '#a79cf0', fontSize: 38, marginBottom: 12 },
  emptyTitle: { color: '#414256', fontWeight: '800', fontSize: 15 },
  emptyBody: { color: '#9091a1', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  retry: { color: '#6847ee', fontWeight: '700', marginTop: 10 },
  clearButton: { borderColor: '#edcfd1', borderWidth: 1, borderRadius: 12, alignItems: 'center', padding: 12, backgroundColor: '#fff' },
  clearText: { color: '#d4474f', fontSize: 12, fontWeight: '700' },
});
