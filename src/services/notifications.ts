import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Фиксирани часове за двете напомняния (24-часов формат, час по устройството).
export const MORNING_REMINDER_HOUR = 9;
export const MORNING_REMINDER_MINUTE = 0;
export const EVENING_REMINDER_HOUR = 20;
export const EVENING_REMINDER_MINUTE = 0;

// Стабилни идентификатори, за да можем да отменяме/презаписваме точно тези
// две напомняния, без да засягаме други насрочени известия (ако някога добавим).
const MORNING_NOTIFICATION_ID = 'daily-morning-reminder';
const EVENING_NOTIFICATION_ID = 'daily-evening-reminder';
const CHANNEL_ID = 'daily-reminders';

// Как да се показва известието, докато приложението е отворено на преден план.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Ежедневни напомняния',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
};

// Връща true ако разрешението е дадено (или вече е било дадено), false ако е отказано.
export const requestNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
};

interface ReminderTexts {
  morningTitle: string;
  morningBody: string;
  eveningTitle: string;
  eveningBody: string;
}

// Насрочва двете ежедневни напомняния (сутрешно + вечерно). Първо отменя
// евентуални стари версии със същите идентификатори, за да няма дубликати
// (напр. ако потребителят изключи и включи известията отново, или смени език).
export const scheduleDailyReminders = async (texts: ReminderTexts): Promise<void> => {
  await ensureAndroidChannel();
  await cancelDailyReminders();

  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_NOTIFICATION_ID,
    content: {
      title: texts.morningTitle,
      body: texts.morningBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: MORNING_REMINDER_HOUR,
      minute: MORNING_REMINDER_MINUTE,
      channelId: CHANNEL_ID,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_NOTIFICATION_ID,
    content: {
      title: texts.eveningTitle,
      body: texts.eveningBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: EVENING_REMINDER_HOUR,
      minute: EVENING_REMINDER_MINUTE,
      channelId: CHANNEL_ID,
    },
  });
};

export const cancelDailyReminders = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(MORNING_NOTIFICATION_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(EVENING_NOTIFICATION_ID).catch(() => {});
};

// Изпраща еднократно тестово известие след няколко секунди — за проверка
// дали пермишъните и цялостният pipeline работят, без да се чака до
// сутрешния/вечерния час. Не засяга насрочените ежедневни напомняния.
export const sendTestNotification = async (title: string, body: string): Promise<void> => {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });
};
