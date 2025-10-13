import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList, TabsParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RoutineScreen from '../screens/RoutineScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

function TabsNavigator() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tabs.Screen name="History" component={HistoryScreen} options={{ title: '기록' }} />
      <Tabs.Screen name="Routine" component={RoutineScreen} options={{ title: '루틴' }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      {/* 추후 세션 화면 추가 예정 */}
    </Stack.Navigator>
  );
}
