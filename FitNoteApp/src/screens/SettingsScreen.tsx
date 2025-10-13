import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  const [dark, setDark] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정</Text>
      <View style={styles.row}>
        <Text>다크 모드 (UI 데모)</Text>
        <Switch value={dark} onValueChange={setDark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
