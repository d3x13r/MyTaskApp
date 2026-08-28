import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
import { CustomAlert } from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import {
  cancelDailyReminders,
  EVENING_REMINDER_HOUR,
  EVENING_REMINDER_MINUTE,
  MORNING_REMINDER_HOUR,
  MORNING_REMINDER_MINUTE,
  requestNotificationPermission,
  scheduleDailyReminders,
} from '../../services/notifications';
import { getReadableErrorMessage } from '../../utils/errorMessage';

const NOTIFICATIONS_STORAGE_KEY = 'notifications_enabled';

const formatHourMinute = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, changePassword, deleteAccount } = useAuth();
  const { deleteAllUserData } = useTasks();
  const { themeMode, setThemeMode, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Дефолт false при първо стартиране — по-честно е, отколкото да изглежда
  // "включено", докато няма реално разрешение и нищо не е насрочено.
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Обобщено състояние за темизирания CustomAlert (замества стандартните
  // системни Alert.alert() известия, за да съответстват на дизайна на приложението)
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' | 'warning' = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // Зареждаме запазеното предпочитание при отваряне на екрана.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        setNotificationsEnabled(stored === 'true');
      } finally {
        setNotificationsLoaded(true);
      }
    })();
  }, []);

  // Ако известията са включени и потребителят смени езика, пренасрочваме
  // напомнянията с преведения текст на новия език.
  useEffect(() => {
    if (!notificationsLoaded || !notificationsEnabled) return;
    scheduleDailyReminders({
      morningTitle: t('notifications.morningTitle'),
      morningBody: t('notifications.morningBody'),
      eveningTitle: t('notifications.eveningTitle'),
      eveningBody: t('notifications.eveningBody'),
    }).catch(() => {});
  }, [language, notificationsLoaded]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showAlert(
          t('profile.notificationsPermissionDeniedTitle'),
          t('profile.notificationsPermissionDeniedMessage'),
          'warning'
        );
        return;
      }
      await scheduleDailyReminders({
        morningTitle: t('notifications.morningTitle'),
        morningBody: t('notifications.morningBody'),
        eveningTitle: t('notifications.eveningTitle'),
        eveningBody: t('notifications.eveningBody'),
      });
      setNotificationsEnabled(true);
      AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'true').catch(() => {});
    } else {
      await cancelDailyReminders();
      setNotificationsEnabled(false);
      AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'false').catch(() => {});
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showAlert(t('common.error'), t('profile.passwordTooShort'), 'error');
      return;
    }
    try {
      await changePassword(newPassword);
      showAlert(t('common.success'), t('profile.passwordChangedSuccess'), 'success');
      setNewPassword('');
      setModalVisible(false);
    } catch (e: any) {
      showAlert(t('common.error'), getReadableErrorMessage(e, t), 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (e: any) {
      showAlert(t('profile.logoutErrorTitle'), getReadableErrorMessage(e, t), 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountPassword) {
      showAlert(t('common.error'), t('profile.deleteAccountPasswordRequired'), 'error');
      return;
    }
    setDeletingAccount(true);
    try {
      // Важно: трием данните в Firestore, ДОКАТО потребителят все още е
      // автентикиран (security rules разчитат на валидно auth.uid).
      // Едва след това чупим самата сесия чрез изтриване на Auth профила.
      await deleteAllUserData();
      await deleteAccount(deleteAccountPassword);
      setDeleteAccountModalVisible(false);
      setDeleteAccountPassword('');
      router.replace('/(auth)/login');
    } catch (e: any) {
      showAlert(t('common.error'), getReadableErrorMessage(e, t), 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>{t('profile.headerSubtitle')}</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.headerTitle')}</Text>
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
              {user?.email ? user.email.split('@')[0] : t('profile.defaultUserName')}
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
            <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.themeLabel')}</Text>
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
                  {mode === 'system' ? t('profile.themeAuto') : mode === 'light' ? t('profile.themeLight') : t('profile.themeDark')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Карта Избор на Език */}
        <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemLeft}>
            <Ionicons name="language-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.languageLabel')}</Text>
          </View>
          <View style={styles.themeSelector}>
            {(['bg', 'en'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      language === lang ? colors.primary : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        language === lang
                          ? colors.textOnPrimary
                          : colors.subText,
                    },
                  ]}
                >
                  {lang === 'bg' ? t('profile.languageBg') : t('profile.languageEn')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Карта Известия */}
        <View style={[styles.settingCard, styles.notificationsCard, { backgroundColor: colors.card }]}>
          <View style={styles.notificationsCardRow}>
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.notificationsLabel')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {notificationsEnabled && (
            <Text style={[styles.notificationsHint, { color: colors.subText, borderTopColor: colors.border }]}>
              {t('profile.notificationsHint', {
                morningTime: formatHourMinute(MORNING_REMINDER_HOUR, MORNING_REMINDER_MINUTE),
                eveningTime: formatHourMinute(EVENING_REMINDER_HOUR, EVENING_REMINDER_MINUTE),
              })}
            </Text>
          )}
        </View>

        {/* Карта Категории */}
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/categories')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="folder-open-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.categoriesLabel')}</Text>
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
            <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.changePasswordLabel')}</Text>
          </View>
        </TouchableOpacity>

        {/* Карта Изтриване на профила — визуално идентична на Смяна на паролата */}
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: colors.card }]}
          onPress={() => setDeleteAccountModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="trash-outline" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.deleteAccountLabel')}</Text>
          </View>
        </TouchableOpacity>

        {/* Бутон Изход — отделен, най-отдолу */}
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
            {t('profile.logoutLabel')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Модал за Смяна на парола */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.newPasswordTitle')}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={t('profile.newPasswordPlaceholder')}
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
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.saveText, { color: colors.textOnPrimary }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модал за Изтриване на профила */}
      <Modal visible={deleteAccountModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.dangerText }]}>
              {t('profile.deleteAccountWarningTitle')}
            </Text>
            <Text style={[styles.deleteAccountWarningText, { color: colors.subText }]}>
              {t('profile.deleteAccountWarningMessage')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={t('profile.deleteAccountPasswordPlaceholder')}
              placeholderTextColor={colors.subText}
              secureTextEntry
              value={deleteAccountPassword}
              onChangeText={setDeleteAccountPassword}
              editable={!deletingAccount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setDeleteAccountModalVisible(false);
                  setDeleteAccountPassword('');
                }}
                disabled={deletingAccount}
              >
                <Text style={[styles.cancelText, { color: colors.subText }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.dangerText, opacity: deletingAccount ? 0.6 : 1 }]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                <Text style={[styles.saveText, { color: '#FFFFFF' }]}>
                  {deletingAccount ? t('profile.deleteAccountInProgress') : t('profile.deleteAccountConfirmButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Темизирано известие — заменя стандартните системни Alert.alert() */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={t('common.ok')}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  notificationsCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  notificationsCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationsHint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
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
  deleteAccountWarningText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
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