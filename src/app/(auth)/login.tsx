import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Грешка', 'Попълнете всички полета');
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
      Alert.alert('Грешка', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Тъмен статус бар, за да се виждат часът и известията */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <Text style={styles.title}>{isRegister ? 'Нова Регистрация' : 'Вход в профила'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Имейл адрес"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Парола"
        placeholderTextColor="#94A3B8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isRegister && (
        <View style={styles.optionsRow}>
          {/* Чекбокс Запомни ме */}
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#181818" />}
            </View>
            <Text style={styles.rememberMeText}>Запомни ме</Text>
          </TouchableOpacity>

          {/* Линк за забравена парола */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotText}>Забравена парола?</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? 'Регистрация' : 'Вход'}</Text>
      </TouchableOpacity>

      {/* Оформен бутон с подчертан текст за действие */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          {isRegister ? 'Вече имате профил?' : 'Нямате профил?'}
        </Text>
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} activeOpacity={0.7}>
          <Text style={styles.switchActionText}>
            {isRegister ? 'Влезте тук' : 'Регистрирайте се'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#0F172A',
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
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  forgotText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FFCC00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#181818',
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
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  switchActionText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});