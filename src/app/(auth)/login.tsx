import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        await login(email, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Грешка', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{isRegister ? 'Нова Регистрация' : 'Вход в профила'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Имейл адрес"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Парола"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isRegister && (
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotText}>Забравена парола?</Text>
        </TouchableOpacity>
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
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  forgotText: { color: '#64748B', textAlign: 'right', marginBottom: 16, fontWeight: '600' },
  button: { backgroundColor: '#FFCC00', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#181818', fontWeight: '800', fontSize: 16 },
  switchContainer: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  switchLabel: { color: '#64748B', fontSize: 15, fontWeight: '500' },
  switchActionText: { color: '#0F172A', fontSize: 15, fontWeight: '800', textDecorationLine: 'underline' },
});