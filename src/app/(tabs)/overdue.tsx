import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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
import { CustomAlert } from '../../components/CustomAlert';
import { useLanguage } from '../../context/LanguageContext';
import { Task, useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

const OVERDUE_COLOR = '#E5484D';
const DIVIDER_COLOR = '#D1D5DB'; // Светлосиво, фиксирано — независимо от темата

// 'YYYY-MM-DD' -> 'ДД-ММ-ГГГГ'
const formatDateDDMMYYYY = (dateString: string) => {
  const [y, m, d] = dateString.split('-');
  return `${d}-${m}-${y}`;
};

export default function OverdueScreen() {
  const { getOverdueTasks, toggleTaskCompletion } = useTasks();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const overdueItems = getOverdueTasks();

  const [pendingConfirm, setPendingConfirm] = useState<{ task: Task; date: string } | null>(null);

  const handleConfirmComplete = () => {
    if (pendingConfirm) {
      toggleTaskCompletion(pendingConfirm.task.id, pendingConfirm.date);
    }
    setPendingConfirm(null);
  };

  // Групираме пропуснатите появявания по дата (overdueItems вече е сортиран
  // от най-скорошна към най-стара дата, така че групите излизат в същия ред).
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: { task: Task; date: string }[] }[] = [];
    overdueItems.forEach((item) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === item.date) {
        lastGroup.items.push(item);
      } else {
        groups.push({ date: item.date, items: [item] });
      }
    });
    return groups;
  }, [overdueItems]);

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
          groupedByDate.map((group) => (
            <View key={group.date}>
              <View style={styles.dateDivider}>
                <View style={[styles.dateDividerLine, { backgroundColor: DIVIDER_COLOR }]} />
                <Text style={[styles.dateDividerText, { color: colors.subText }]}>
                  {formatDateDDMMYYYY(group.date)}
                </Text>
                <View style={[styles.dateDividerLine, { backgroundColor: DIVIDER_COLOR }]} />
              </View>

              {group.items.map(({ task, date }) => (
                <TouchableOpacity
                  key={`${task.id}_${date}`}
                  style={[
                    styles.taskCard,
                    { backgroundColor: colors.card, borderLeftColor: OVERDUE_COLOR },
                  ]}
                  onPress={() => setPendingConfirm({ task, date })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ellipse-outline" size={24} color={OVERDUE_COLOR} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    <Text style={[styles.taskSubtext, { color: colors.subText }]}>
                      {task.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <CustomAlert
        visible={pendingConfirm !== null}
        title={t('overdue.confirmTitle')}
        message={pendingConfirm ? t('overdue.confirmMessage', { title: pendingConfirm.task.title }) : ''}
        type="warning"
        showCancel
        confirmText={t('common.ok')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmComplete}
        onCancel={() => setPendingConfirm(null)}
      />
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 10,
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
