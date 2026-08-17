import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const CustomBottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const insets = useSafeAreaInsets();
  
  const BASE_NAV_HEIGHT = 65;
  const R = 24; // Радиус на обратната извивка
  
  // Общата височина включва базовия бар + долната безопасна зона (bottom inset)
  const TOTAL_HEIGHT = BASE_NAV_HEIGHT + insets.bottom;

  // Динамичен SVG path с вдлъбнатите ъгли отгоре
  const d = `
    M 0 0
    Q 0 ${R} ${R} ${R}
    H ${SCREEN_WIDTH - R}
    Q ${SCREEN_WIDTH} ${R} ${SCREEN_WIDTH} 0
    V ${TOTAL_HEIGHT}
    H 0
    Z
  `;

  const ACTIVE_COLOR = '#D99B00';
  const INACTIVE_COLOR = '#8E8E93';

  return (
    <View style={[styles.navWrapper, { height: TOTAL_HEIGHT }]}>
      {/* SVG фон за обратната извивка */}
      <Svg width={SCREEN_WIDTH} height={TOTAL_HEIGHT} style={StyleSheet.absoluteFill}>
        <Path d={d} fill="#FFFFFF" />
      </Svg>

      <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
        {/* Tab 1: Табло */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('dashboard')} activeOpacity={0.7}>
          <Ionicons
            name={activeTab === 'dashboard' ? 'calendar' : 'calendar-outline'}
            size={24}
            color={activeTab === 'dashboard' ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
            Табло
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Задачи */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('tasks')} activeOpacity={0.7}>
          <Ionicons
            name={activeTab === 'tasks' ? 'checkbox' : 'checkbox-outline'}
            size={24}
            color={activeTab === 'tasks' ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'tasks' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
            Задачи
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Статистика */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('stats')} activeOpacity={0.7}>
          <Ionicons
            name={activeTab === 'stats' ? 'stats-chart' : 'stats-chart-outline'}
            size={24}
            color={activeTab === 'stats' ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'stats' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
            Статистика
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Настройки */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')} activeOpacity={0.7}>
          <Ionicons
            name={activeTab === 'profile' ? 'settings' : 'settings-outline'}
            size={24}
            color={activeTab === 'profile' ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'profile' ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
            Настройки
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justify: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});