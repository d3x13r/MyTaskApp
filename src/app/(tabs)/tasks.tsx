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
import { Task, useTasks } from '../../context/TaskContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Работа');
  const [repeat, setRepeat] = useState('none');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const handleSave = () => {
    if (!title.trim()) return;

    onAddTask({
      title,
      category,
      startDate,
      endDate,
      repeat,
    });

    setTitle('');
    setCategory('Работа');
    setRepeat('none');
    setStartDate(getTodayString());
    setEndDate(getTodayString());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Нова Задача</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form}>
            <Text style={modalStyles.label}>Заглавие</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Въведете заглавие..."
              value={title}
              onChangeText={setTitle}
            />

            <Text style={modalStyles.label}>Категория</Text>
            <View style={modalStyles.row}>
              {['Работа', 'Лични', 'Здраве', 'Обучение'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    modalStyles.chip,
                    category === cat && modalStyles.chipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      category === cat && modalStyles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>Начална дата (ГГГГ-ММ-ДД)</Text>
            <TextInput
              style={modalStyles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={modalStyles.label}>Крайна дата (ГГГГ-ММ-ДД)</Text>
            <TextInput
              style={modalStyles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={modalStyles.label}>Повторение</Text>
            <View style={modalStyles.row}>
              {[
                { label: 'Без', value: 'none' },
                { label: 'Всеки ден', value: 'day' },
                { label: 'Всяка седмица', value: 'week' },
              ].map((rep) => (
                <TouchableOpacity
                  key={rep.value}
                  style={[
                    modalStyles.chip,
                    repeat === rep.value && modalStyles.chipActive,
                  ]}
                  onPress={() => setRepeat(rep.value)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      repeat === rep.value && modalStyles.chipTextActive,
                    ]}
                  >
                    {rep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
            <Text style={modalStyles.saveButtonText}>Запази Задачата</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, task, onClose, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Работа');
  const [repeat, setRepeat] = useState('none');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setRepeat(task.repeat || 'none');
      setStartDate(task.startDate);
      setEndDate(task.endDate);
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;

    onUpdateTask({
      ...task,
      title,
      category,
      startDate,
      endDate,
      repeat,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Редактирай Задача</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form}>
            <Text style={modalStyles.label}>Заглавие</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Въведете заглавие..."
              value={title}
              onChangeText={setTitle}
            />

            <Text style={modalStyles.label}>Категория</Text>
            <View style={modalStyles.row}>
              {['Работа', 'Лични', 'Здраве', 'Обучение'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    modalStyles.chip,
                    category === cat && modalStyles.chipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      category === cat && modalStyles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>Начална дата (ГГГГ-ММ-ДД)</Text>
            <TextInput
              style={modalStyles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={modalStyles.label}>Крайна дата (ГГГГ-ММ-ДД)</Text>
            <TextInput
              style={modalStyles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={modalStyles.label}>Повторение</Text>
            <View style={modalStyles.row}>
              {[
                { label: 'Без', value: 'none' },
                { label: 'Всеки ден', value: 'day' },
                { label: 'Всяка седмица', value: 'week' },
              ].map((rep) => (
                <TouchableOpacity
                  key={rep.value}
                  style={[
                    modalStyles.chip,
                    repeat === rep.value && modalStyles.chipActive,
                  ]}
                  onPress={() => setRepeat(rep.value)}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      repeat === rep.value && modalStyles.chipTextActive,
                    ]}
                  >
                    {rep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
            <Text style={modalStyles.saveButtonText}>Запази Промените</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TasksScreen() {
  const { tasks, addTask, updateTask } = useTasks();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('Всички');

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === 'Всички') return true;
    return t.category === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Всички Задачи</Text>
      </View>

      {/* Филтри по категории */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Всички', 'Работа', 'Лични', 'Здраве', 'Обучение'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Списък със задачи */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={36} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>Няма намерени задачи</Text>
          </View>
        ) : (
          filteredTasks.map((item) => (
            <View
              key={item.id}
              style={[styles.taskCard, styles.yellowAccentCard]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSubtext}>
                  {item.category} • {item.startDate}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingTask(item)}
              >
                <Ionicons name="pencil-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Плаващ бутон за добавяне */}
      <TouchableOpacity
        style={styles.floatingFabButton}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#181818" />
      </TouchableOpacity>

      {/* Модали */}
      <AddTaskModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddTask={addTask}
      />

      <EditTaskModal
        visible={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdateTask={updateTask}
      />
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#181818',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
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
  yellowAccentCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFCC00',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181818',
  },
  taskSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginLeft: 8,
  },
  floatingFabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#FFCC00',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
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
    color: '#0F172A',
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#FFCC00',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#181818',
  },
  saveButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: '800',
  },
});