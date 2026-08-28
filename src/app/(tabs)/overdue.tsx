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
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

const OVERDUE_COLOR = '#E5484D';

export default function OverdueScreen() {
  const { getOverdueTasks, toggleTaskCompletion } = useTasks();
  const { colors, isDark } = useTheme();
  const { t, tArray } = useLanguage();

  const overdueItems = getOverdueTasks();

  const formatOverdueDate = (dateString: string) => {
    const monthsShort = tArray('monthsShort');
    const [, m, d] = dateString.split('-').map(Number);
    return `${d} ${monthsShort[m - 1]}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          {overdueItems.length > 0 ? t('overdue.missedCount', { count: overdueItems.length }) : t('overdue.noMissed')}
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('overdue.title')}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollPadding, { paddingBottom: 100 }]}
      >
        {overdueItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.subText} />
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>
              {t('overdue.noMissedDetail')}
            </Text>
          </View>
        ) : (
          overdueItems.map(({ task, date }) => (
            <TouchableOpacity
              key={`${task.id}_${date}`}
              style={[
                styles.taskCard,
                { backgroundColor: colors.card, borderLeftColor: OVERDUE_COLOR },
              ]}
              onPress={() => toggleTaskCompletion(task.id, date)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipse-outline" size={24} color={OVERDUE_COLOR} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                <Text style={[styles.taskSubtext, { color: colors.subText }]}>
                  {task.category} · {t('overdue.overdueSince', { date: formatOverdueDate(date) })}
                </Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  scrollPadding: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  taskCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
