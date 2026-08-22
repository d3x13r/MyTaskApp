import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useTasks } from '../context/TaskContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory, deleteCategory } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      Alert.alert('Грешка', 'Тази категория вече съществува.');
      return;
    }

    try {
      await addCategory(trimmed);
      setNewCategoryName('');
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Грешка при запис', e.message);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    Alert.alert(
      'Изтриване',
      `Сигурни ли сте, че искате да изтриете категория "${categoryToDelete}"?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            if (deleteCategory) {
              try {
                setDeletingCategory(categoryToDelete);
                await deleteCategory(categoryToDelete);
              } catch (e: any) {
                Alert.alert('Грешка при изтриване', e.message);
              } finally {
                setDeletingCategory(null);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Шапка с бутон "Назад" */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Категории</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        {categories.map((item: string) => (
          <View key={item} style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              <Ionicons name="folder-outline" size={20} color="#64748B" style={{ marginRight: 12 }} />
              <Text style={styles.categoryTitle}>{item}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCategory(item)}
              disabled={deletingCategory === item}
            >
              {deletingCategory === item ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button за добавяне */}
      <TouchableOpacity
        style={styles.floatingFabButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#181818" />
      </TouchableOpacity>

      {/* Модал за добавяне на категория */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Нова Категория</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>Име на категорията</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="напр. Хоби, Финанси..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <TouchableOpacity style={modalStyles.saveButton} onPress={handleAddCategory}>
              <Text style={modalStyles.saveButtonText}>Добави Категория</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 90,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181818',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
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
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: '800',
  },
});