import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomAlert } from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getReadableErrorMessage } from '../../utils/errorMessage';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { t, language, setLanguage } = useLanguage();
  const { colors, isDark } = useTheme();

  // Състояние за CustomAlert
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const { login, register } = useAuth();
  const router = useRouter();

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showAlert(t('common.error'), t('auth.fillAllFields'));
      return;
    }
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password, rememberMe);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert(t('auth.loginErrorTitle'), getReadableErrorMessage(error, t));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.languageSwitcher}>
        {(['bg', 'en'] as const).map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => setLanguage(lang)}
            style={[
              styles.languageOption,
              { backgroundColor: language === lang ? colors.primary : colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.languageOptionText,
                { color: language === lang ? colors.textOnPrimary : colors.subText },
              ]}
            >
              {lang === 'bg' ? t('profile.languageBg') : t('profile.languageEn')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder={t('auth.emailPlaceholder')}
        placeholderTextColor={colors.subText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder={t('auth.passwordPlaceholder')}
        placeholderTextColor={colors.subText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isRegister && (
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: colors.card }, rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color={colors.textOnPrimary} />}
            </View>
            <Text style={[styles.rememberMeText, { color: colors.subText }]}>{t('auth.rememberMe')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={[styles.forgotText, { color: colors.subText }]}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
        <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>{isRegister ? t('auth.registerButton') : t('auth.loginButton')}</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: colors.subText }]}>
          {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
        </Text>
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} activeOpacity={0.7}>
          <Text style={[styles.switchActionText, { color: colors.text }]}>
            {isRegister ? t('auth.loginLink') : t('auth.registerLink')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Персонализиран изглед на съобщенията */}
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  languageSwitcher: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    right: 20,
    flexDirection: 'row',
    gap: 6,
  },
  languageOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  languageOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotText: {
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 16,
  },
  switchContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  switchActionText: {
    fontSize: 15,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
