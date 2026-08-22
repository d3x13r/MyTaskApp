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
import { useTheme } from '../../context/ThemeContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getFormattedDateBD = () => {
  const now = new Date();
  const days = ['НЕДЕЛЯ', 'ПОНЕДЕЛНИК', 'ВТОРНИК', 'СРЯДА', 'ЧЕТВЪРТЪК', 'ПЕТЪК', 'СЪБОТА'];
  const months = [
    'ЯНУАРИ', 'ФЕВРУАРИ', 'МАРТ', 'АПРИЛ', 'МАЙ', 'ЮНИ',
    'ЮЛИ', 'АВГУСТ', 'СЕПТЕМВРИ', 'ОКТЕМВРИ', 'НОЕМВРИ', 'ДЕКЕМВРИ'
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
};

export default function HomeScreen() {
  const { getTasksForDate, isTaskCompletedOnDate, toggleTaskCompletion } = useTasks();
  const { colors, isDark } = useTheme();

  const todayStr = getTodayString();
  const todayTasks = getTasksForDate(todayStr);

  const completedCount = todayTasks.filter((t) => isTaskCompletedOnDate(t.id, todayStr)).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.dateSubtitle, { color: colors.subText }]}>{getFormattedDateBD()}</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Днешен Преглед</Text>
      </View>

<ScrollView 
  style={{ flex: 1 }} 
  contentContainerStyle={[styles.scrollPadding, { paddingBottom: 100 }]}
>
        <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.progressTitle, { color: colors.subText }]}>НАПРЕДЪК ЗА ДНЕС</Text>
          <View style={styles.progressRow}>
            <Text style={[styles.progressPercent, { color: colors.text }]}>{progressPercent}%</Text>
            <Text style={[styles.progressSubtext, { color: colors.subText }]}>
              {completedCount} от {totalCount} изпълнени
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Текущи Задачи за Днес</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.countBadgeText, { color: colors.subText }]}>{totalCount}</Text>
          </View>
        </View>

        {todayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.subText} />
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>Няма задачи за днес</Text>
          </View>
        ) : (
          todayTasks.map((item) => {
            const isCompleted = isTaskCompletedOnDate(item.id, todayStr);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.taskCard,
                  styles.yellowAccentCard,
                  { backgroundColor: colors.card, borderLeftColor: colors.primary }
                ]}
                onPress={() => toggleTaskCompletion(item.id, todayStr)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isCompleted ? colors.primary : colors.subText}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: colors.text },
                      isCompleted && { color: colors.subText, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.taskSubtext, { color: colors.subText }]}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            );
          })
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
  dateSubtitle: {
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
  progressCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 12,
  },
  progressPercent: {
    fontSize: 36,
    fontWeight: '900',
  },
  progressSubtext: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 10,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  taskCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  yellowAccentCard: {
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