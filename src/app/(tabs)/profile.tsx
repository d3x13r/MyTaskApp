import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>НАСТРОЙКИ</Text>
          <Text style={styles.headerTitle}>Профил</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={24} color="#181818" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Потребител</Text>
            <Text style={styles.userEmail}>user@example.com</Text>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="notifications-outline" size={20} color="#181818" />
              <Text style={styles.settingText}>Известия</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5EA', true: '#FFCC00' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>
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
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#181818',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  scrollPadding: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181818',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 16,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#181818',
  },
});