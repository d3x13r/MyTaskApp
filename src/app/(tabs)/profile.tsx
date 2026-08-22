import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, changePassword } = useAuth();
  const { themeMode, setThemeMode, colors } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Грешка', 'Паролата трябва да е поне 6 символа.');
      return;
    }
    try {
      await changePassword(newPassword);
      Alert.alert('Успех', 'Паролата беше променена успешно.');
      setNewPassword('');
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Грешка', e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Грешка при изход', e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>НАСТРОЙКИ</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Профил</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        {/* Карта Потребител */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.background }]}>
            <Ionicons name="person-outline" size={24} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.email ? user.email.split('@')[0] : 'Потребител'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.subText }]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Карта Избор на Тема */}
        <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemLeft}>
            <Ionicons name="moon-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Тема</Text>
          </View>
          <View style={styles.themeSelector}>
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      themeMode === mode ? colors.primary : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === mode
                          ? colors.textOnPrimary
                          : colors.subText,
                    },
                  ]}
                >
                  {mode === 'system' ? 'Авто' : mode === 'light' ? 'Светла' : 'Тъмна'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Карта Известия */}
        <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Известия</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Карта Категории */}
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/categories')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="folder-open-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Категории</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        {/* Карта Смяна на парола */}
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: colors.card }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="key-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Смяна на паролата</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        {/* Бутон Изход (Вътре в ScrollView с визуално разстояние) */}
        <TouchableOpacity
          style={[
            styles.logoutCard,
            { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, marginTop: 12 },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.dangerText} />
          <Text style={[styles.logoutText, { color: colors.dangerText }]}>
            Изход от профила
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Модал за Смяна на парола */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Нова парола</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Въведете новата парола"
              placeholderTextColor={colors.subText}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colors.subText }]}>
                  Отказ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.saveText, { color: colors.textOnPrimary }]}>
                  Запази
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 2,
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 100, // Място отдолу за навигационната лента
  },
  userCard: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  settingCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  themeOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  saveText: {
    fontWeight: '800',
  },
});