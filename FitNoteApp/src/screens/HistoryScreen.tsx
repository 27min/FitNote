import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>기록 히스토리</Text>
      <Text style={styles.caption}>이전 운동 기록이 여기 표시됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  caption: { color: '#666' },
});
