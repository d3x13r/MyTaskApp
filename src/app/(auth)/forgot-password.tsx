import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getReadableErrorMessage } from '../../utils/errorMessage';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { resetPassword } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('forgotPassword.emailRequired'));
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(t('common.success'), t('forgotPassword.successMessage'), [
        { text: t('common.ok'), onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert(t('common.error'), getReadableErrorMessage(error, t));
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

      <Text style={[styles.title, { color: colors.text }]}>{t('forgotPassword.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.subText }]}>{t('forgotPassword.subtitle')}</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder={t('auth.emailPlaceholder')}
        placeholderTextColor={colors.subText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleReset}>
        <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>{t('forgotPassword.sendLink')}</Text>
      </TouchableOpacity>
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
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontWeight: '800', fontSize: 16 },
});
