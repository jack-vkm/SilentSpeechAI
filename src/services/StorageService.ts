import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sv_history';

export type HistoryRecord = {
  id: string;
  text: string;
  createdAt: number;
};

export default {
  async save(record: HistoryRecord) {
    const cur = await AsyncStorage.getItem(KEY);
    const arr: HistoryRecord[] = cur ? JSON.parse(cur) : [];
    arr.unshift(record);
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },
  async update(record: HistoryRecord) {
    const cur = await AsyncStorage.getItem(KEY);
    const arr: HistoryRecord[] = cur ? JSON.parse(cur) : [];
    const index = arr.findIndex(item => item.id === record.id);
    if (index === -1) {
      throw new Error(`History record not found: ${record.id}`);
    }
    arr[index] = { ...arr[index], ...record };
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },
  async list(): Promise<HistoryRecord[]> {
    const cur = await AsyncStorage.getItem(KEY);
    return cur ? JSON.parse(cur) : [];
  },
  async remove(id: string) {
    const cur = await AsyncStorage.getItem(KEY);
    const arr: HistoryRecord[] = cur ? JSON.parse(cur) : [];
    const filtered = arr.filter(r => r.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  },
  async clear() {
    await AsyncStorage.removeItem(KEY);
  }
};
