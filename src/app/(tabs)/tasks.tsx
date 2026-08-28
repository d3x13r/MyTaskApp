import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomAlert } from '../../components/CustomAlert';
import { Task, useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

const addOneYearStr = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

// Само за визуализация: 'YYYY-MM-DD' -> 'ДД-ММ-ГГГГ'. Съхранението остава непроменено.
const formatDateDDMMYYYY = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
};

type ExtendedRepeatOption = Task['repeat'] | 'custom';

const getRepeatOptions = (t: (key: string) => string): { label: string; value: ExtendedRepeatOption }[] => [
  { label: t('repeat.noneOption'), value: 'none' },
  { label: t('repeat.dayOption'), value: 'day' },
  { label: t('repeat.weekOption'), value: 'week' },
  { label: t('repeat.monthOption'), value: 'month' },
  { label: t('repeat.yearOption'), value: 'year' },
  { label: t('repeat.customOption'), value: 'custom' },
];

const getRepeatLabel = (repeat: string | undefined, t: (key: string, params?: Record<string, string | number>) => string) => {
  if (!repeat || repeat === 'none') return t('repeat.noneLabel');
  if (repeat === 'day') return t('repeat.dayLabel');
  if (repeat === 'week') return t('repeat.weekLabel');
  if (repeat === 'month') return t('repeat.monthLabel');
  if (repeat === 'year') return t('repeat.yearLabel');
  if (repeat.startsWith('custom_')) {
    const days = repeat.split('_')[1];
    return t('repeat.customLabel', { days });
  }
  return repeat;
};

interface CustomDatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
}

const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const { t, tArray } = useLanguage();
  const monthNames = tArray('months');
  const weekdaysShort = tArray('weekdaysShort');
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + 'T00:00:00');
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  }, [selectedDate, visible]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={calendarStyles.overlay}>
        <View style={[calendarStyles.container, { backgroundColor: colors.card }]}>
          <View style={calendarStyles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={[calendarStyles.navButton, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[calendarStyles.monthTitle, { color: colors.text }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={[calendarStyles.navButton, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={calendarStyles.weekDaysRow}>
            {weekdaysShort.map((day) => (
              <Text key={day} style={[calendarStyles.weekDayText, { color: colors.subText }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={calendarStyles.daysGrid}>
            {daysArray.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={calendarStyles.dayCell} />;
              }

              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = dateStr === selectedDate;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    calendarStyles.dayCell,
                    isSelected && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    onSelectDate(dateStr);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      calendarStyles.dayText,
                      { color: isSelected ? colors.textOnPrimary : colors.text },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[calendarStyles.closeButton, { backgroundColor: colors.inputBg }]} onPress={onClose}>
            <Text style={[calendarStyles.closeButtonText, { color: colors.subText }]}>{t('datePicker.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface AddTaskModalProps {
  visible: boolean;
  categories: string[];
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, categories, onClose, onAddTask }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const repeatOptions = getRepeatOptions(t);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [repeat, setRepeat] = useState<ExtendedRepeatOption>('none');
  const [customDays, setCustomDays] = useState('2');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories, visible]);

  const handleRepeatChange = (newRepeat: ExtendedRepeatOption) => {
    setRepeat(newRepeat);
    if (newRepeat === 'none') {
      setEndDate(startDate);
    } else {
      setEndDate(addOneYearStr(startDate));
    }
  };

  const handleStartDateSelect = (d: string) => {
    setStartDate(d);
    if (repeat === 'none') {
      setEndDate(d);
    } else {
      setEndDate(addOneYearStr(d));
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const finalRepeat = (repeat === 'custom' ? `custom_${customDays}` : repeat) as Task['repeat'];

    onAddTask({
      title,
      category,
      startDate,
      endDate: repeat === 'none' ? startDate : endDate,
      repeat: finalRepeat,
    });

    setTitle('');
    setCategory(categories[0] || '');
    setRepeat('none');
    setCustomDays('2');
    setStartDate(getTodayString());
    setEndDate(getTodayString());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
          <View style={modalStyles.header}>
            <Text style={[modalStyles.title, { color: colors.text }]}>{t('taskModal.newTaskTitle')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form} showsVerticalScrollIndicator={false}>
            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.titleLabel')}</Text>
            <TextInput
              style={[
                modalStyles.input,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }
              ]}
              placeholder={t('taskModal.titlePlaceholder')}
              placeholderTextColor={colors.subText}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.repeatLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.scrollRow}>
              {repeatOptions.map((rep) => (
                <TouchableOpacity
                  key={rep.value}
                  style={[
                    modalStyles.chip,
                    { backgroundColor: colors.inputBg },
                    repeat === rep.value && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleRepeatChange(rep.value)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      { color: colors.subText },
                      repeat === rep.value && { color: colors.textOnPrimary },
                    ]}
                  >
                    {rep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.categoryLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.scrollRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    modalStyles.chip,
                    { backgroundColor: colors.inputBg },
                    category === cat && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      { color: colors.subText },
                      category === cat && { color: colors.textOnPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {repeat === 'custom' && (
              <>
                <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.frequencyLabel')}</Text>
                <View style={[modalStyles.customDaysContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput
                    style={[modalStyles.customDaysInput, { color: colors.text }]}
                    keyboardType="numeric"
                    value={customDays}
                    onChangeText={setCustomDays}
                    placeholder="1"
                    placeholderTextColor={colors.subText}
                  />
                  <Text style={[modalStyles.customDaysText, { color: colors.subText }]}>{t('taskModal.daysUnit')}</Text>
                </View>
              </>
            )}

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.startDateLabel')}</Text>
            <TouchableOpacity
              style={[modalStyles.dateInputButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('start')}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
              <Text style={[modalStyles.dateInputText, { color: colors.text }]}>{formatDateDDMMYYYY(startDate)}</Text>
            </TouchableOpacity>

            {repeat !== 'none' && (
              <>
                <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.endDateLabel')}</Text>
                <TouchableOpacity
                  style={[modalStyles.dateInputButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  onPress={() => setActivePicker('end')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
                  <Text style={[modalStyles.dateInputText, { color: colors.text }]}>{formatDateDDMMYYYY(endDate)}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[modalStyles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[modalStyles.saveButtonText, { color: colors.textOnPrimary }]}>{t('taskModal.saveNewButton')}</Text>
          </TouchableOpacity>
        </View>

        <CustomDatePickerModal
          visible={activePicker !== null}
          selectedDate={activePicker === 'start' ? startDate : endDate}
          onClose={() => setActivePicker(null)}
          onSelectDate={(d) => {
            if (activePicker === 'start') {
              handleStartDateSelect(d);
            } else {
              setEndDate(d < startDate ? startDate : d);
            }
          }}
        />
      </View>
    </Modal>
  );
};

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  categories: string[];
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, task, categories, onClose, onUpdateTask }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const repeatOptions = getRepeatOptions(t);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [repeat, setRepeat] = useState<ExtendedRepeatOption>('none');
  const [customDays, setCustomDays] = useState('2');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      
      const rep = task.repeat || 'none';
      if (rep.startsWith('custom')) {
        setRepeat('custom');
        const days = rep.split('_')[1] || '2';
        setCustomDays(days);
      } else {
        setRepeat(rep as ExtendedRepeatOption);
      }

      setStartDate(task.startDate);

      if (rep !== 'none' && task.endDate) {
        setEndDate(task.endDate);
      } else if (rep !== 'none') {
        setEndDate(addOneYearStr(task.startDate));
      } else {
        setEndDate(task.startDate);
      }
    }
  }, [task]);

  const handleRepeatChange = (newRepeat: ExtendedRepeatOption) => {
    setRepeat(newRepeat);
    if (newRepeat === 'none') {
      setEndDate(startDate);
    } else {
      setEndDate(addOneYearStr(startDate));
    }
  };

  const handleStartDateSelect = (d: string) => {
    setStartDate(d);
    if (repeat === 'none') {
      setEndDate(d);
    } else {
      setEndDate(addOneYearStr(d));
    }
  };

  const handleSave = () => {
    if (!task || !title.trim()) return;

    const finalRepeat = (repeat === 'custom' ? `custom_${customDays}` : repeat) as Task['repeat'];

    onUpdateTask({
      ...task,
      title,
      category,
      startDate,
      endDate: repeat === 'none' ? startDate : endDate,
      repeat: finalRepeat,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
          <View style={modalStyles.header}>
            <Text style={[modalStyles.title, { color: colors.text }]}>{t('taskModal.editTaskTitle')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form} showsVerticalScrollIndicator={false}>
            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.titleLabel')}</Text>
            <TextInput
              style={[
                modalStyles.input,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }
              ]}
              placeholder={t('taskModal.titlePlaceholder')}
              placeholderTextColor={colors.subText}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.repeatLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.scrollRow}>
              {repeatOptions.map((rep) => (
                <TouchableOpacity
                  key={rep.value}
                  style={[
                    modalStyles.chip,
                    { backgroundColor: colors.inputBg },
                    repeat === rep.value && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleRepeatChange(rep.value)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      { color: colors.subText },
                      repeat === rep.value && { color: colors.textOnPrimary },
                    ]}
                  >
                    {rep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.categoryLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.scrollRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    modalStyles.chip,
                    { backgroundColor: colors.inputBg },
                    category === cat && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      { color: colors.subText },
                      category === cat && { color: colors.textOnPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {repeat === 'custom' && (
              <>
                <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.frequencyLabel')}</Text>
                <View style={[modalStyles.customDaysContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput
                    style={[modalStyles.customDaysInput, { color: colors.text }]}
                    keyboardType="numeric"
                    value={customDays}
                    onChangeText={setCustomDays}
                    placeholder="1"
                    placeholderTextColor={colors.subText}
                  />
                  <Text style={[modalStyles.customDaysText, { color: colors.subText }]}>{t('taskModal.daysUnit')}</Text>
                </View>
              </>
            )}

            <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.startDateLabel')}</Text>
            <TouchableOpacity
              style={[modalStyles.dateInputButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('start')}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
              <Text style={[modalStyles.dateInputText, { color: colors.text }]}>{formatDateDDMMYYYY(startDate)}</Text>
            </TouchableOpacity>

            {repeat !== 'none' && (
              <>
                <Text style={[modalStyles.label, { color: colors.subText }]}>{t('taskModal.endDateLabel')}</Text>
                <TouchableOpacity
                  style={[modalStyles.dateInputButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  onPress={() => setActivePicker('end')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
                  <Text style={[modalStyles.dateInputText, { color: colors.text }]}>{formatDateDDMMYYYY(endDate)}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[modalStyles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[modalStyles.saveButtonText, { color: colors.textOnPrimary }]}>{t('taskModal.saveEditButton')}</Text>
          </TouchableOpacity>
        </View>

        <CustomDatePickerModal
          visible={activePicker !== null}
          selectedDate={activePicker === 'start' ? startDate : endDate}
          onClose={() => setActivePicker(null)}
          onSelectDate={(d) => {
            if (activePicker === 'start') {
              handleStartDateSelect(d);
            } else {
              setEndDate(d < startDate ? startDate : d);
            }
          }}
        />
      </View>
    </Modal>
  );
};

const ALL_FILTER = '__all__';

export default function TasksScreen() {
  const { getTasksForDate, addTask, updateTask, deleteTask, categories } = useTasks();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const tasks = getTasksForDate('') || []; 

  // Забележка: НЕ подменяме с DEFAULT_CATEGORIES, когато categories е празен —
  // това е валидно състояние (потребителят е изтрил всички категории), а не
  // индикатор, че данните още не са заредени. Иначе изтритите дефолтни
  // категории "възкръсват" всеки път при отваряне на приложението.
  const categoriesList: string[] = categories || [];

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(ALL_FILTER);

  const [deleteAlertConfig, setDeleteAlertConfig] = useState<{
    visible: boolean;
    task: Task | null;
  }>({
    visible: false,
    task: null,
  });

  const filteredTasks = tasks.filter((t: Task) => {
    if (selectedFilter === ALL_FILTER) return true;
    return t.category === selectedFilter;
  });

  const promptDeleteTask = (task: Task) => {
    setDeleteAlertConfig({
      visible: true,
      task,
    });
  };

  const confirmDeleteTask = async () => {
    if (deleteAlertConfig.task && deleteTask) {
      await deleteTask(deleteAlertConfig.task.id);
    }
    setDeleteAlertConfig({ visible: false, task: null });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>{t('tasks.headerSubtitle')}</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tasks.headerTitle')}</Text>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[ALL_FILTER, ...categoriesList].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: colors.inputBg },
                selectedFilter === filter && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.subText },
                  selectedFilter === filter && { color: colors.textOnPrimary },
                ]}
              >
                {filter === ALL_FILTER ? t('tasks.filterAll') : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollPadding}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={36} color={colors.subText} />
            <Text style={[styles.emptyStateText, { color: colors.subText }]}>{t('tasks.noTasksFound')}</Text>
          </View>
        ) : (
          filteredTasks.map((item: Task) => {
            const hasRepeat = item.repeat && item.repeat !== 'none';
            return (
              <View
                key={item.id}
                style={[
                  styles.taskCard,
                  styles.yellowAccentCard,
                  { backgroundColor: colors.card, borderLeftColor: colors.primary }
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  
                  <Text style={[styles.taskSubtext, { color: colors.subText }]}>
                    {item.category} • {getRepeatLabel(item.repeat, t)}
                  </Text>
                  
                  <Text style={[styles.taskDateText, { color: colors.subText }]}>
                    {t('tasks.from')}: {formatDateDDMMYYYY(item.startDate)}
                    {hasRepeat && item.endDate ? `  ${t('tasks.to')}: ${formatDateDDMMYYYY(item.endDate)}` : ''}
                  </Text>
                </View>
                
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.inputBg }]}
                    onPress={() => setEditingTask(item)}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.subText} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: isDark ? '#3A1E1E' : '#FEF2F2' }]}
                    onPress={() => promptDeleteTask(item)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingFabButton, { backgroundColor: colors.primary }]}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>

      <AddTaskModal
        visible={addModalVisible}
        categories={categoriesList}
        onClose={() => setAddModalVisible(false)}
        onAddTask={addTask}
      />

      <EditTaskModal
        visible={!!editingTask}
        task={editingTask}
        categories={categoriesList}
        onClose={() => setEditingTask(null)}
        onUpdateTask={updateTask}
      />

      {/* Персонализиран модал за потвърждение на изтриването */}
      <CustomAlert
        visible={deleteAlertConfig.visible}
        title={t('tasks.deleteConfirmTitle')}
        message={t('tasks.deleteConfirmMessage', { title: deleteAlertConfig.task?.title || '' })}
        type="warning"
        showCancel
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteAlertConfig({ visible: false, task: null })}
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
    paddingBottom: 12,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 120,
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
    fontWeight: '600',
    marginTop: 4,
  },
  taskDateText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingFabButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  customDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  customDaysInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  customDaysText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  dateInputText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});

const calendarStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekDaysRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});