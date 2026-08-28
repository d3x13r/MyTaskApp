import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { CustomAlert } from '../components/CustomAlert';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory, deleteCategory } = useTasks();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    showCancel?: boolean;
    confirmText?: string;
    targetCategory?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      setAlertConfig({
        visible: true,
        title: t('common.error'),
        message: t('categories.alreadyExists'),
        type: 'error',
      });
      return;
    }

    try {
      await addCategory(trimmed);
      setNewCategoryName('');
      setModalVisible(false);
    } catch (e: any) {
      setAlertConfig({
        visible: true,
        title: t('categories.addErrorTitle'),
        message: e.message,
        type: 'error',
      });
    }
  };

  const promptDeleteCategory = (categoryToDelete: string) => {
    setAlertConfig({
      visible: true,
      title: t('categories.deleteConfirmTitle'),
      message: t('categories.deleteConfirmMessage', { name: categoryToDelete }),
      type: 'warning',
      showCancel: true,
      confirmText: t('common.delete'),
      targetCategory: categoryToDelete,
    });
  };

  const confirmDeleteCategory = async () => {
    const categoryToDelete = alertConfig.targetCategory;
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    if (categoryToDelete && deleteCategory) {
      try {
        setDeletingCategory(categoryToDelete);
        await deleteCategory(categoryToDelete);
      } catch (e: any) {
        setAlertConfig({
          visible: true,
          title: t('categories.deleteErrorTitle'),
          message: e.message,
          type: 'error',
        });
      } finally {
        setDeletingCategory(null);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* Шапка с бутон "Назад" */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? '#2A2A2A' : '#F1F5F9' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('categories.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        {categories.map((item: string) => (
          <View
            key={item}
            style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.categoryRow}>
              <Ionicons name="folder-outline" size={20} color={colors.subText} style={{ marginRight: 12 }} />
              <Text style={[styles.categoryTitle, { color: colors.text }]}>{item}</Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: isDark ? '#3A1E1E' : '#FEF2F2' }]}
              onPress={() => promptDeleteCategory(item)}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingFabButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#181818" />
      </TouchableOpacity>

      {/* Модал за добавяне на категория */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('categories.newCategoryTitle')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: colors.subText }]}>{t('categories.nameLabel')}</Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={colors.subText}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <TouchableOpacity style={styles.modalSaveButton} onPress={handleAddCategory}>
              <Text style={styles.modalSaveButtonText}>{t('categories.addButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Персонализиран изглед за потвърждения и грешки */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.showCancel ? confirmDeleteCategory : () => setAlertConfig((p) => ({ ...p, visible: false }))}
        onCancel={() => setAlertConfig((p) => ({ ...p, visible: false }))}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 90,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalSaveButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSaveButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: '800',
  },
});
