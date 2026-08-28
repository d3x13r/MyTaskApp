import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { getTasksForDate, isTaskCompletedOnDate, getOverdueTasks } = useTasks();

  const ACTIVE_COLOR = '#FFCC00'; // Активен жълт цвят
  const INACTIVE_COLOR = colors.subText;

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = 60 + bottomPadding;

  const todayStr = getTodayString();
  const todayTasks = getTasksForDate(todayStr);
  const incompleteTodayCount = todayTasks.filter((task) => !isTaskCompletedOnDate(task.id, todayStr)).length;
  const overdueCount = getOverdueTasks().length;

  // React Navigation показва бадж само ако стойността е truthy — при 0 не подаваме нищо.
  const dashboardBadge = incompleteTodayCount > 0 ? incompleteTodayCount : undefined;
  const overdueBadge = overdueCount > 0 ? overdueCount : undefined;

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
            title: t('tabs.dashboard'),
            tabBarBadge: dashboardBadge,
            tabBarBadgeStyle: {
              backgroundColor: '#FFCC00',
              color: '#181818',
              fontSize: 10,
              fontWeight: '800',
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="overdue"
          options={{
            title: t('overdue.tabTitle'),
            tabBarBadge: overdueBadge,
            tabBarBadgeStyle: {
              backgroundColor: '#E5484D',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: '800',
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'alert-circle' : 'alert-circle-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: t('tabs.tasks'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: t('tabs.stats'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}