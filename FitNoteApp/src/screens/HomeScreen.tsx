import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  type ListRenderItemInfo,
  type PressableStateCallbackType,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { theme } from '../theme';
import type { TabsParamList } from '../navigations/types';
import type { WorkoutSummary } from '../types/workout';

const spacing = theme.spacing;
const radius = theme.radius;
const typography = theme.typography;
const colors = theme.color;

const MAX_RECENT_COUNT = 5;

const mockRecentWorkouts: WorkoutSummary[] = [
  {
    id: 'w1',
    date: '2025-03-06',
    routineName: '상체 강화',
    totalSets: 12,
    totalVolumeKg: 9450,
    durationMinutes: 58,
  },
  {
    id: 'w2',
    date: '2025-03-04',
    routineName: '하체 집중',
    totalSets: 10,
    totalVolumeKg: 10320,
    durationMinutes: 64,
  },
  {
    id: 'w3',
    date: '2025-03-02',
    routineName: '풀바디',
    totalSets: 14,
    totalVolumeKg: 8760,
    durationMinutes: 72,
  },
  {
    id: 'w4',
    date: '2025-02-28',
    routineName: '코어 집중',
    totalSets: 8,
    totalVolumeKg: 4320,
    durationMinutes: 42,
  },
  {
    id: 'w5',
    date: '2025-02-26',
    routineName: '상체 펌프',
    totalSets: 9,
    totalVolumeKg: 7150,
    durationMinutes: 55,
  },
];

type HomeTabNavigation = BottomTabNavigationProp<TabsParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const recentWorkouts = React.useMemo(
    () => mockRecentWorkouts.slice(0, MAX_RECENT_COUNT),
    [],
  );

  const weeklyGoal = 5;
  const completedThisWeek = React.useMemo(() => recentWorkouts.filter(workout => isWithinLastDays(workout.date, 7)).length, [recentWorkouts]);
  const activeStreak = 4;
  const weeklyProgress = Math.min(1, completedThisWeek / weeklyGoal);
  const progressPercent = Math.round(weeklyProgress * 100);

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      }),
    [],
  );
  const volumeFormatter = React.useMemo(() => new Intl.NumberFormat('ko-KR'), []);

  const handleNavigateHistory = React.useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const handleStartWorkout = React.useCallback(() => {
    navigation.navigate('Routine');
  }, [navigation]);

  const renderWorkoutItem = React.useCallback(
    ({ item }: ListRenderItemInfo<WorkoutSummary>) => (
      <Pressable
        accessibilityRole="button"
        onPress={handleNavigateHistory}
        style={workoutCardPressableStyle}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutRoutine}>{item.routineName}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.muted}
            accessibilityElementsHidden
          />
        </View>
        <Text style={styles.workoutDate}>
          {dateFormatter.format(new Date(item.date))}
        </Text>
        <View style={styles.workoutMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="barbell"
              size={16}
              color={colors.primary['500']}
              accessibilityElementsHidden
            />
            <Text style={styles.metaText}>{item.totalSets}세트</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="speedometer"
              size={16}
              color={colors.primary['500']}
              accessibilityElementsHidden
            />
            <Text style={styles.metaText}>
              {volumeFormatter.format(item.totalVolumeKg)}kg
            </Text>
          </View>
          {item.durationMinutes ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="time"
                size={16}
                color={colors.primary['500']}
                accessibilityElementsHidden
              />
              <Text style={styles.metaText}>{item.durationMinutes}분</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    ),
    [dateFormatter, handleNavigateHistory, volumeFormatter],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.heroIconWrapper}>
              <Ionicons
                name="flame"
                size={32}
                color={colors.primary['500']}
                accessibilityElementsHidden
              />
            </View>
            <Text style={styles.heroTitle}>오늘의 운동</Text>
            <Text style={styles.heroSubtitle}>
              최근 기록과 루틴으로 빠르게 시작하세요.
            </Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>이번 주 진행률</Text>
              <View style={styles.streakPill}>
                <Ionicons
                  name="calendar"
                  size={18}
                  color={colors.primary['500']}
                  accessibilityElementsHidden
                />
                <Text style={styles.streakText}>{activeStreak}일 연속</Text>
              </View>
            </View>
            <Text style={styles.statusBody}>
              주 {weeklyGoal}회 목표 중 {completedThisWeek}회 완료
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
              <Text style={styles.progressCaption}>꾸준함이 힘이 됩니다.</Text>
            </View>
          </View>

          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              <Pressable
                accessibilityRole="button"
                style={linkButtonPressableStyle}
                onPress={handleNavigateHistory}
              >
                {({ pressed }) => (
                  <View style={styles.linkButtonContent}>
                    <Text
                      style={[
                        styles.linkButtonText,
                        pressed && styles.linkButtonTextPressed,
                      ]}
                    >
                      모두 보기
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.primary['500']}
                      style={styles.linkButtonIcon}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            <FlatList
              data={recentWorkouts}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={ListSeparator}
              renderItem={renderWorkoutItem}
              ListEmptyComponent={EmptyRecentState}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={handleStartWorkout}
            style={primaryButtonPressableStyle}
          >
            <Text style={styles.primaryButtonText}>오늘의 운동 시작</Text>
            <Ionicons
              name="play"
              size={20}
              color={colors.surface}
              accessibilityElementsHidden
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function isWithinLastDays(dateISO: string, days: number) {
  const now = new Date();
  const targetDate = new Date(dateISO);
  const diff = now.getTime() - targetDate.getTime();
  const threshold = days * 24 * 60 * 60 * 1000;
  return diff <= threshold && diff >= 0;
}

const linkButtonPressableStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.linkButton,
  pressed && styles.linkButtonPressed,
];

const workoutCardPressableStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.workoutCard,
  pressed && styles.workoutCardPressed,
];

const primaryButtonPressableStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.primaryButton,
  pressed && styles.primaryButtonPressed,
];

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}

function EmptyRecentState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="barbell-outline"
        size={32}
        color={colors.text.muted}
        accessibilityElementsHidden
      />
      <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
      <Text style={styles.emptyBody}>첫 운동을 등록해 보세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['6'],
    paddingBottom: spacing['12'],
  },
  heroSection: {
    marginBottom: spacing['6'],
  },
  heroIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary['50'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  heroTitle: {
    fontSize: typography.display.xl.size,
    lineHeight: typography.display.xl.lineHeight,
    fontWeight: typography.display.xl.weight as '400' | '500' | '600' | '700' | '800' | '900',
    color: colors.text.primary,
  },
  heroSubtitle: {
    marginTop: spacing['2'],
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.secondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['5'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing['6'],
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: theme.shadow.md,
    shadowOffset: { width: 0, height: 2 },
    elevation: theme.shadow.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  statusTitle: {
    fontSize: typography.title.md.size,
    lineHeight: typography.title.md.lineHeight,
    fontWeight: typography.title.md.weight as '600' | '700',
    color: colors.text.primary,
  },
  statusBody: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.secondary,
    marginBottom: spacing['4'],
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.xl,
    backgroundColor: colors.primary['100'],
  },
  streakText: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    fontWeight: '600',
    color: colors.primary['600'],
    marginLeft: spacing['1'],
  },
  progressBar: {
    height: spacing['2'],
    borderRadius: radius.xl,
    backgroundColor: colors.primary['50'],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary['500'],
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['3'],
  },
  progressPercent: {
    fontSize: typography.title.md.size,
    lineHeight: typography.title.md.lineHeight,
    fontWeight: typography.title.md.weight as '600' | '700',
    color: colors.text.primary,
  },
  progressCaption: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  sectionTitle: {
    fontSize: typography.title.md.size,
    lineHeight: typography.title.md.lineHeight,
    fontWeight: typography.title.md.weight as '600' | '700',
    color: colors.text.primary,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing['2'],
  },
  linkButtonPressed: {
    opacity: 0.85,
  },
  linkButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    fontWeight: '600',
    color: colors.primary['500'],
  },
  linkButtonTextPressed: {
    color: colors.primary['600'],
  },
  linkButtonIcon: {
    marginLeft: spacing['1'],
  },
  listSeparator: {
    height: spacing['4'],
  },
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['5'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: theme.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    elevation: theme.shadow.sm,
  },
  workoutCardPressed: {
    opacity: 0.85,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['1'],
  },
  workoutRoutine: {
    fontSize: typography.title.md.size,
    lineHeight: typography.title.md.lineHeight,
    fontWeight: typography.title.md.weight as '600' | '700',
    color: colors.text.primary,
  },
  workoutDate: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.secondary,
    marginBottom: spacing['3'],
  },
  workoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing['2'],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing['4'],
    marginBottom: spacing['2'],
  },
  metaText: {
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.primary,
    marginLeft: spacing['1'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['10'],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyTitle: {
    marginTop: spacing['3'],
    fontSize: typography.title.md.size,
    lineHeight: typography.title.md.lineHeight,
    fontWeight: typography.title.md.weight as '600' | '700',
    color: colors.text.primary,
  },
  emptyBody: {
    marginTop: spacing['1'],
    fontSize: typography.body.md.size,
    lineHeight: typography.body.md.lineHeight,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['6'],
    paddingTop: spacing['4'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary['500'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['3'],
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: typography.label.lg.size,
    lineHeight: typography.label.lg.lineHeight,
    fontWeight: typography.label.lg.weight as '600' | '700',
    color: colors.surface,
    marginRight: spacing['1'],
  },
});
