import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,   // ✅ REQUIRED (iOS)
    shouldShowList: true,     // ✅ REQUIRED (iOS)
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask permission correctly (Android 13+ supported)
 */
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log('❌ Notifications require a real device');
    return false;
  }

  let { status } = await Notifications.getPermissionsAsync();

  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync({
      android: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    status = request.status;
  }

  if (status !== 'granted') {
    Alert.alert(
      'Notifications désactivées',
      'Activez les notifications dans les paramètres Android'
    );
    return false;
  }

  // ✅ ANDROID CHANNEL (REQUIRED)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rappels de repas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#A3C981',
      sound: 'default',
    });
  }

  return true;
};

/**
 * Schedule daily meal reminders
 */
export const scheduleMealReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const meals = [
      { title: 'Petit-déjeuner 🍳', hour: 8, minute: 30 },
      { title: 'Déjeuner 🥗', hour: 12, minute: 30 },
      { title: 'Dîner 🍽️', hour: 19, minute: 30 },
    ];

    for (const meal of meals) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "C'est l'heure de manger !",
          body: `N'oubliez pas votre ${meal.title}`,
          sound: 'default',
        },
        trigger: {
          hour: meal.hour,
          minute: meal.minute,
          repeats: true,
          channelId: 'default',
        },
      });
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`✅ ${scheduled.length} notifications programmées`);

  } catch (error) {
    console.error('❌ Notification error:', error);
  }
};

/**
 * Simple test notification (5 seconds)
 */
export const testNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test réussi ✅',
      body: 'Notification envoyée après 5 secondes',
      sound: 'default',
    },
    trigger: {
      seconds: 5,
      channelId: 'default',
    },
  });
};
