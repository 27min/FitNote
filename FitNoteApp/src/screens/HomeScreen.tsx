import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 운동</Text>
      <Text style={styles.caption}>최근 기록과 루틴으로 빠르게 시작하세요.</Text>
      <Button title="운동 시작하기" onPress={() => Alert.alert('아직: 세션 화면은 추후 추가 예정')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  caption: { color: '#666' },
});
