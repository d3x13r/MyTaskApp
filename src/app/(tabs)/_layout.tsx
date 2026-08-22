import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const ACTIVE_COLOR = '#FFCC00'; // Активен жълт цвят
  const INACTIVE_COLOR = colors.subText;

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = 60 + bottomPadding;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarStyle: {
            height: tabBarHeight,
            backgroundColor: colors.card, // Ползва цвета на картите (тъмно сиво)
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: bottomPadding,
            paddingTop: 8,
            borderTopWidth: 0,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Табло',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Задачи',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Статистика',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Настройки',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}