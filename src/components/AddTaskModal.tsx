import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Настройка на локализацията за български език
LocaleConfig.locales['bg'] = {
  monthNames: ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'],
  monthNamesShort: ['Ян.', 'Фев.', 'Мар.', 'Апр.', 'Май', 'Юни', 'Юли', 'Авг.', 'Сеп.', 'Окт.', 'Ноем.', 'Дек.'],
  dayNames: ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'],
  dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Днес'
};
LocaleConfig.defaultLocale = 'bg';

export type RepeatOption = 'none' | 'day' | 'week' | 'month' | 'year' | 'custom';

export interface TaskData {
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  repeat: RepeatOption;
}

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: TaskData) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, onAddTask }) => {
  const todayStr = getTodayString();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Лични');
  const [showDates, setShowDates] = useState(true);
  const [newTaskStartDate, setNewTaskStartDate] = useState(todayStr);
  const [newTaskEndDate, setNewTaskEndDate] = useState(todayStr);
  const [newTaskRepeat, setNewTaskRepeat] = useState<RepeatOption>('none');

  // Логика за персонализирания календар модал
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');

  const showDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    setCalendarVisible(true);
  };

  const handleSelectDay = (day: { dateString: string }) => {
    if (datePickerTarget === 'start') {
      setNewTaskStartDate(day.dateString);
    } else {
      setNewTaskEndDate(day.dateString);
    }
    setCalendarVisible(false);
  };

  const repeatOptions: { label: string; value: RepeatOption }[] = [
    { label: 'Без', value: 'none' },
    { label: 'Ден', value: 'day' },
    { label: 'Седмица', value: 'week' },
    { label: 'Месец', value: 'month' },
    { label: 'Година', value: 'year' },
    { label: 'По избор', value: 'custom' },
  ];

  const handleSave = () => {
    if (!newTaskTitle.trim()) return;

    const startDateToUse = showDates ? (newTaskStartDate || todayStr) : todayStr;
    const endDateToUse = showDates ? (newTaskEndDate || startDateToUse) : todayStr;

    onAddTask({
      title: newTaskTitle,
      category: newTaskCategory,
      startDate: startDateToUse,
      endDate: endDateToUse,
      repeat: showDates ? newTaskRepeat : 'none',
    });

    setNewTaskTitle('');
    setShowDates(true);
    setNewTaskStartDate(todayStr);
    setNewTaskEndDate(todayStr);
    setNewTaskRepeat('none');
    onClose();
  };

  const selectedDate = datePickerTarget === 'start' ? newTaskStartDate : newTaskEndDate;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#181818" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Нова Задача</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.whiteCard}>

            <Text style={styles.inputLabel}>Име на задачата</Text>
            <TextInput
              style={styles.roundedInput}
              placeholder="напр. Утринна йога"
              placeholderTextColor="#A0A0A0"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Повтаряемост</Text>
              <Switch
                value={showDates}
                onValueChange={setShowDates}
                trackColor={{ false: '#E5E5EA', true: '#FFCC00' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {showDates && (
              <>
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

                {/* Начална дата */}
                <Text style={styles.inputLabel}>Начална дата</Text>
                <TouchableOpacity
                  style={styles.dateSelectorButton}
                  onPress={() => showDatePicker('start')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#D99B00" />
                  <Text style={styles.dateSelectorText}>{newTaskStartDate}</Text>
                </TouchableOpacity>

                {/* Крайна дата */}
                <Text style={styles.inputLabel}>Крайна дата</Text>
                <TouchableOpacity
                  style={styles.dateSelectorButton}
                  onPress={() => showDatePicker('end')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#D99B00" />
                  <Text style={styles.dateSelectorText}>{newTaskEndDate}</Text>
                </TouchableOpacity>
              </>
            )}

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
          <TouchableOpacity style={styles.yellowButton} onPress={handleSave} activeOpacity={0.88}>
            <Ionicons name="add-circle-outline" size={22} color="#181818" />
            <Text style={styles.yellowButtonText}>Създай задача</Text>
          </TouchableOpacity>
        </View>

        {/* Изцяло нов стилизиран календар в модален прозорец */}
        <Modal
          visible={isCalendarVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                onDayPress={handleSelectDay}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#FFCC00', selectedTextColor: '#181818' },
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#FFCC00',
                  selectedDayTextColor: '#181818',
                  todayTextColor: '#D99B00',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  arrowColor: '#181818',
                  monthTextColor: '#181818',
                  indicatorColor: '#FFCC00',
                  textDayFontWeight: '600',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 15,
                  textMonthFontSize: 17,
                  textDayHeaderFontSize: 12,
                }}
              />
              <TouchableOpacity
                style={styles.closeCalendarButton}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={styles.closeCalendarText}>Затвори</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  dateSelectorButton: {
    backgroundColor: '#F4F4F6',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateSelectorText: {
    fontSize: 15,
    fontWeight: '600',
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
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeCalendarButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 16,
  },
  closeCalendarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181818',
  },
});