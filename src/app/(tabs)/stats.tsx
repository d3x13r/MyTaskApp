import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>ПРОГРЕС И АНАЛИЗ</Text>
          <Text style={styles.headerTitle}>Статистика</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Общо дефинирани задачи</Text>
          <Text style={styles.statsBigNumber}>4</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Изтекли задачи</Text>
          <Text style={[styles.statsBigNumber, { color: '#8E8E93' }]}>0</Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsBigNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#181818',
    marginTop: 4,
  },
});