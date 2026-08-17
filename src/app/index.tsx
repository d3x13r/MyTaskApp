import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type RepeatOption = 'none' | 'day' | 'week' | 'month' | 'year' | 'custom';

interface Task {
  id: string;
  title: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  repeat?: RepeatOption;
  completedToday?: boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getFutureDateString = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'stats' | 'profile'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('Всички');

  // --- Scroll State за скриване на FAB ---
  const [isFabVisible, setIsFabVisible] = useState(true);
  const lastOffsetY = useRef(0);

  const todayStr = getTodayString();

  // --- TASK STATE ---
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Утринна йога',
      category: 'Здраве',
      startDate: todayStr,
      endDate: todayStr,
      repeat: 'day',
      completedToday: false,
    },
    {
      id: '2',
      title: 'Седмичен преглед на задачи',
      category: 'Работа',
      startDate: getFutureDateString(-2),
      endDate: getFutureDateString(1),
      repeat: 'week',
      completedToday: true,
    },
    {
      id: '3',
      title: 'Плащане на сметки',
      category: 'Финанси',
      startDate: getFutureDateString(-5),
      endDate: getFutureDateString(-1),
      repeat: 'month',
      completedToday: false,
    },
    {
      id: '4',
      title: 'Подготовка на презентация',
      category: 'Работа',
      startDate: getFutureDateString(1),
      endDate: getFutureDateString(3),
      repeat: 'none',
      completedToday: false,
    },
  ]);

  // --- MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Лични');
  const [showDates, setShowDates] = useState(true);
  const [newTaskStartDate, setNewTaskStartDate] = useState(todayStr);
  const [newTaskEndDate, setNewTaskEndDate] = useState(todayStr);
  const [newTaskRepeat, setNewTaskRepeat] = useState<RepeatOption>('none');

  // --- PROFILE STATE ---
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const categories = ['Всички', 'Работа', 'Лични', 'Здраве', 'Финанси'];

  const repeatOptions: { label: string; value: RepeatOption }[] = [
      { label: 'По избор', value: 'custom' },
    { label: 'Ден', value: 'day' },
    { label: 'Седмица', value: 'week' },
    { label: 'Месец', value: 'month' },
    { label: 'Година', value: 'year' },

  ];

  const toggleTaskToday = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completedToday: !t.completedToday } : t)));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const startDateToUse = showDates ? (newTaskStartDate || todayStr) : todayStr;
    const endDateToUse = showDates ? (newTaskEndDate || startDateToUse) : todayStr;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTaskTitle,
        category: newTaskCategory,
        startDate: startDateToUse,
        endDate: endDateToUse,
        repeat: showDates ? newTaskRepeat : 'none',
        completedToday: false,
      },
    ]);

    // Нулиране на формата
    setNewTaskTitle('');
    setShowDates(true);
    setNewTaskStartDate(todayStr);
    setNewTaskEndDate(todayStr);
    setNewTaskRepeat('none');
    setModalVisible(false);
  };

  const getTaskStatus = (task: Task) => {
    if (task.endDate < todayStr) return { color: '#8E8E93', bg: '#F2F2F7', label: 'Изтекла' };
    if (task.startDate <= todayStr && task.endDate >= todayStr) return { color: '#FFCC00', bg: '#FFF9E5', label: 'Активна' };
    return { color: '#34C759', bg: '#EAFCEB', label: 'Предстояща' };
  };

  const todayActiveTasks = tasks.filter((t) => t.startDate <= todayStr && t.endDate >= todayStr);
  const todayCompletedCount = todayActiveTasks.filter((t) => t.completedToday).length;
  const todayTotalCount = todayActiveTasks.length;
  const todayProgressPct = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const filteredAndSortedTasks = tasks
    .filter((t) => {
      if (selectedCategory !== 'Всички' && t.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // --- ЛОГИКА ЗА СКРИВАНЕ И ПОКАЗВАНЕ НА БУТОНА ПРИ СКРОЛ ---
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;

    if (currentOffsetY <= 0) {
      setIsFabVisible(true);
    } else if (currentOffsetY > lastOffsetY.current && currentOffsetY > 0) {
      setIsFabVisible(false);
    }

    lastOffsetY.current = currentOffsetY;
  };

  const formattedTodayDate = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const ACTIVE_COLOR = '#D99B00';
  const INACTIVE_COLOR = '#8E8E93';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* --- ОСНОВНО СЪДЪРЖАНИЕ --- */}
        <View style={styles.mainContent}>

          {/* ================= TAB 1: ТАБЛО ================= */}
          {activeTab === 'dashboard' && (
            <View style={styles.tabContent}>
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
            </View>
          )}

          {/* ================= TAB 2: ЗАДАЧИ ================= */}
          {activeTab === 'tasks' && (
            <View style={styles.tabContent}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerSubtitle}>МОДЕЛИРАНЕ И АРХИВ</Text>
                  <Text style={styles.headerTitle}>Всички Задачи</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Общо: {tasks.length}</Text>
                </View>
              </View>

              <View style={styles.categoryWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => setSelectedCategory(cat)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollPadding, { paddingBottom: 85 }]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {filteredAndSortedTasks.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={36} color="#CCCCCC" />
                    <Text style={styles.emptyStateText}>Няма намерени задачи</Text>
                  </View>
                ) : (
                  filteredAndSortedTasks.map((item) => {
                    const status = getTaskStatus(item);
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.taskCard,
                          { borderLeftWidth: 5, borderLeftColor: status.color },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.taskTitle}>{item.title}</Text>
                          <View style={styles.taskMetaRow}>
                            <Text style={styles.taskCategory}>{item.category}</Text>
                            <View style={[styles.dateBadge, { backgroundColor: status.bg }]}>
                              <Ionicons name="calendar-outline" size={12} color={status.color} style={{ marginRight: 4 }} />
                              <Text style={{ color: status.color, fontSize: 11, fontWeight: '700' }}>
                                {item.startDate}  ➔  {item.endDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {isFabVisible && (
                <TouchableOpacity style={styles.yellowFab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
                  <Ionicons name="add" size={20} color="#181818" style={{ marginRight: 4 }} />
                  <Text style={styles.yellowFabText}>Нова задача</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ================= TAB 3: STATS ================= */}
          {activeTab === 'stats' && (
            <View style={styles.tabContent}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerSubtitle}>ПРОГРЕС И АНАЛИЗ</Text>
                  <Text style={styles.headerTitle}>Статистика</Text>
                </View>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Общо дефинирани задачи</Text>
                  <Text style={styles.statsBigNumber}>{tasks.length}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Изтекли задачи</Text>
                  <Text style={[styles.statsBigNumber, { color: '#8E8E93' }]}>
                    {tasks.filter((t) => t.endDate < todayStr).length}
                  </Text>
                </View>
              </ScrollView>
            </View>
          )}

          {/* ================= TAB 4: PROFILE ================= */}
          {activeTab === 'profile' && (
            <View style={styles.tabContent}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerSubtitle}>НАСТРОЙКИ</Text>
                  <Text style={styles.headerTitle}>Профил</Text>
                </View>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
                <View style={styles.userCard}>
                  <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={24} color="#181818" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>Потребител</Text>
                    <Text style={styles.userEmail}>user@example.com</Text>
                  </View>
                </View>

                <View style={styles.settingsGroup}>
                  <View style={styles.settingItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="notifications-outline" size={20} color="#181818" />
                      <Text style={styles.settingText}>Известия</Text>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: '#E5E5EA', true: '#FFCC00' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          )}

        </View>

        {/* --- НАВИГАЦИЯ --- */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('dashboard')} activeOpacity={0.7}>
            <Ionicons name={activeTab === 'dashboard' ? 'calendar' : 'calendar-outline'} size={24} color={activeTab === 'dashboard' ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>Табло</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('tasks')} activeOpacity={0.7}>
            <Ionicons name={activeTab === 'tasks' ? 'list' : 'list-outline'} size={24} color={activeTab === 'tasks' ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.navLabel, { color: activeTab === 'tasks' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>Задачи</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('stats')} activeOpacity={0.7}>
            <Ionicons name={activeTab === 'stats' ? 'stats-chart' : 'stats-chart-outline'} size={24} color={activeTab === 'stats' ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.navLabel, { color: activeTab === 'stats' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>Статистика</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')} activeOpacity={0.7}>
            <Ionicons name={activeTab === 'profile' ? 'settings' : 'settings-outline'} size={24} color={activeTab === 'profile' ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>Настройки</Text>
          </TouchableOpacity>
        </View>

        {/* --- МОДАЛ: СЪЗДАВАНЕ НА ЗАДАЧА --- */}
        <Modal visible={modalVisible} animationType="slide" transparent={false}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#181818" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Нова Задача</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.whiteCard}>

                {/* Име на задачата */}
                <Text style={styles.inputLabel}>Име на задачата</Text>
                <TextInput
                  style={styles.roundedInput}
                  placeholder="напр. Утринна йога"
                  placeholderTextColor="#A0A0A0"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                />

                {/* Слайдер (Switch) за Повтаряемост */}
                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Повтаряемост</Text>
                  <Switch
                    value={showDates}
                    onValueChange={setShowDates}
                    trackColor={{ false: '#E5E5EA', true: '#FFCC00' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Бутони за честота и полета за дати */}
                {showDates && (
                  <>
                    {/* 1. Опции за повторение (Преди датите) */}
                    <Text style={styles.inputLabel}>Честота</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {repeatOptions.map((option) => {
                        const isSelected = newTaskRepeat === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[styles.unitChip, isSelected && styles.unitChipActive]}
                            onPress={() => setNewTaskRepeat(option.value)}
                          >
                            <Text style={[styles.unitChipText, isSelected && styles.unitChipTextActive]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* 2. Полета за дати (След бутоните) */}
                    <Text style={styles.inputLabel}>Начална дата (ГГГГ-ММ-ДД)</Text>
                    <TextInput
                      style={styles.roundedInput}
                      placeholder="2026-05-18"
                      placeholderTextColor="#A0A0A0"
                      value={newTaskStartDate}
                      onChangeText={setNewTaskStartDate}
                    />

                    <Text style={styles.inputLabel}>Крайна дата (ГГГГ-ММ-ДД)</Text>
                    <TextInput
                      style={styles.roundedInput}
                      placeholder="2026-05-18"
                      placeholderTextColor="#A0A0A0"
                      value={newTaskEndDate}
                      onChangeText={setNewTaskEndDate}
                    />
                  </>
                )}

                {/* Категория */}
                <Text style={styles.inputLabel}>Категория</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Работа', 'Лични', 'Здраве', 'Финанси'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.unitChip, newTaskCategory === cat && styles.unitChipActive]}
                      onPress={() => setNewTaskCategory(cat)}
                    >
                      <Text style={[styles.unitChipText, newTaskCategory === cat && styles.unitChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.yellowButton} onPress={handleAddTask} activeOpacity={0.88}>
                <Ionicons name="add-circle-outline" size={22} color="#181818" />
                <Text style={styles.yellowButtonText}>Създай задача</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mainContent: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  badge: {
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#181818',
    fontWeight: '700',
    fontSize: 13,
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
  categoryWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F4F6',
  },
  chipActive: {
    backgroundColor: '#181818',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 30,
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
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181818',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  yellowFab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  yellowFabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#181818',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsBigNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#181818',
    marginTop: 4,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181818',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 16,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#181818',
  },
  bottomNav: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#181818',
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  roundedInput: {
    backgroundColor: '#F4F4F6',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#181818',
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F4F4F6',
  },
  unitChipActive: {
    backgroundColor: '#181818',
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  yellowButton: {
    backgroundColor: '#FFCC00',
    borderRadius: 30,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  yellowButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#181818',
  },
});