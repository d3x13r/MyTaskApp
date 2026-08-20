import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTasks } from '../../context/TaskContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function DashboardScreen() {
  // Вземаме данните и функцията директно от Context-а
  const { tasks, toggleTaskToday } = useTasks();
  const todayStr = getTodayString();

  const todayActiveTasks = tasks.filter((t) => t.startDate <= todayStr && t.endDate >= todayStr);
  const todayCompletedCount = todayActiveTasks.filter((t) => t.completedToday).length;
  const todayTotalCount = todayActiveTasks.length;
  const todayProgressPct = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const formattedTodayDate = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>{formattedTodayDate.toUpperCase()}</Text>
          <Text style={styles.headerTitle}>Днешен Преглед</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.dashboardProgressCard}>
          <Text style={styles.dashboardCardTitle}>Напредък за днес</Text>
          <View style={styles.progressTextRow}>
            <Text style={styles.dashboardProgressPct}>{todayProgressPct}%</Text>
            <Text style={styles.dashboardProgressSub}>
              {todayCompletedCount} от {todayTotalCount} изпълнени
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${todayProgressPct}%` }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Текущи Задачи за Днес</Text>
          <Text style={styles.sectionCount}>{todayTotalCount}</Text>
        </View>

        {todayActiveTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={36} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>Няма активни задачи за днес!</Text>
          </View>
        ) : (
          todayActiveTasks.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.taskCard,
                styles.dashboardTaskCard,
                item.completedToday && styles.taskCardDone,
              ]}
              onPress={() => toggleTaskToday(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.completedToday && styles.checkboxDone]}>
                {item.completedToday && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, item.completedToday && styles.taskTitleDone]}>
                  {item.title}
                </Text>
                <Text style={styles.taskCategory}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#181818',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  scrollPadding: {
    padding: 20,
  },
  dashboardProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  dashboardCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  dashboardProgressPct: {
    fontSize: 36,
    fontWeight: '800',
    color: '#181818',
  },
  dashboardProgressSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181818',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dashboardTaskCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFCC00',
  },
  taskCardDone: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#181818',
    borderColor: '#181818',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181818',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
});