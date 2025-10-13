import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RoutineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>루틴 관리</Text>
      <Text style={styles.caption}>루틴 추가/수정 기능을 추후 연결합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  caption: { color: '#666' },
});
