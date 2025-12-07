import React from 'react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AuthNavigator from './AuthNavigation';
import type { RootStackParamList, TabsParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RoutineScreen from '../screens/RoutineScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

const tabIcons: Record<keyof TabsParamList, { filled: string; outline: string }> = {
  Home: { filled: 'home', outline: 'home-outline' },
  History: { filled: 'time', outline: 'time-outline' },
  Routine: { filled: 'list', outline: 'list-outline' },
  Settings: { filled: 'settings', outline: 'settings-outline' },
};

const headerStyle = {
  backgroundColor: theme.color.surface,
  shadowColor: 'transparent',
};

const headerTitleStyle = {
  fontSize: theme.typography.label.lg.size,
  lineHeight: theme.typography.label.lg.lineHeight,
  fontWeight: theme.typography.label.lg.weight as '500' | '600' | '700',
  color: theme.color.text.primary,
};

const tabBarStyle = {
  backgroundColor: theme.color.surface,
  borderTopColor: theme.color.border,
  borderTopWidth: StyleSheet.hairlineWidth,
  paddingVertical: theme.spacing['1'],
  height: 56,
};

const tabBarLabelStyle = {
  fontSize: theme.typography.body.md.size,
  lineHeight: theme.typography.body.md.lineHeight,
  marginBottom: theme.spacing['1'] / 2,
};

const createTabScreenOptions = ({
  route,
}: {
  route: { name: keyof TabsParamList };
}): BottomTabNavigationOptions => ({
  headerStyle,
  headerTitleStyle,
  tabBarStyle,
  tabBarActiveTintColor: theme.color.primary['500'],
  tabBarInactiveTintColor: theme.color.text.muted,
  tabBarLabelStyle,
  tabBarIcon: createTabBarIcon(route.name),
});

const createTabBarIcon = (routeName: keyof TabsParamList) => ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => {
  const icon = tabIcons[routeName];
  const name = focused ? icon.filled : icon.outline;
  return <Ionicons name={name} size={20} color={color} />;
};


function TabsNavigator() {
  return (
    <Tabs.Navigator screenOptions={createTabScreenOptions}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tabs.Screen name="History" component={HistoryScreen} options={{ title: '기록' }} />
      <Tabs.Screen name="Routine" component={RoutineScreen} options={{ title: '루틴' }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <Stack.Screen name="Tabs" component={TabsNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
