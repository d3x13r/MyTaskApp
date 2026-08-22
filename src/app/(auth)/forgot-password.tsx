import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { resetPassword } = useAuth();
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Грешка', 'Моля, въведете имейл');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Успех', 'Изпратихме ви линк за възстановяване на паролата.', [
        { text: 'ОК', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Грешка', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Възстановяване на парола</Text>
      <Text style={styles.subtitle}>Въведете вашия имейл адрес и ще ви изпратим инструкция.</Text>

      <TextInput
        style={styles.input}
        placeholder="Имейл адрес"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Изпрати Линк</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FFCC00', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#181818', fontWeight: '800', fontSize: 16 },
});