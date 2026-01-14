import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }

    return finalStatus === 'granted';
  }

  static async scheduleReminder(reminder: Reminder): Promise<string> {
    // Check permissions first
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const reminderTime = new Date(reminder.reminderTime);
    const now = new Date();

    // Don't schedule if reminder time is in the past
    if (reminderTime <= now) {
      throw new Error('Reminder time must be in the future');
    }

    // Calculate seconds until reminder
    const secondsUntilReminder = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

    console.log('Scheduling notification:', {
      title: reminder.title,
      reminderTime: reminderTime.toISOString(),
      now: now.toISOString(),
      secondsUntilReminder,
    });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description || 'Reminder',
        sound: true,
        data: {
          reminderId: reminder.id,
          todoId: reminder.todoId,
        },
      },
      trigger: {
        type: 'date',
        date: reminderTime,
      },
    });

    console.log('Notification scheduled successfully with ID:', notificationId);
    return notificationId;
  }

  static async scheduleRecurringReminder(reminder: Reminder): Promise<string[]> {
    const notificationIds: string[] = [];
    const reminderTime = new Date(reminder.reminderTime);
    const pattern = reminder.recurrencePattern?.toLowerCase();

    if (!pattern) {
      return notificationIds;
    }

    // Schedule next 10 occurrences
    for (let i = 0; i < 10; i++) {
      let nextTime: Date;

      switch (pattern) {
        case 'daily':
          nextTime = new Date(reminderTime);
          nextTime.setDate(nextTime.getDate() + i);
          break;
        case 'weekly':
          nextTime = new Date(reminderTime);
          nextTime.setDate(nextTime.getDate() + i * 7);
          break;
        case 'monthly':
          nextTime = new Date(reminderTime);
          nextTime.setMonth(nextTime.getMonth() + i);
          break;
        default:
          continue;
      }

      if (nextTime > new Date()) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.description || 'Reminder',
            sound: true,
            data: {
              reminderId: reminder.id,
              todoId: reminder.todoId,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextTime,
          },
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static async checkPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  static async verifyNotificationScheduled(reminderId: number): Promise<boolean> {
    const scheduled = await this.getScheduledNotifications();
    return scheduled.some(n => n.content.data?.reminderId === reminderId);
  }
}

