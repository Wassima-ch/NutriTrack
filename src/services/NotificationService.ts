import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Demande de permissions
 */
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) return false;

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }

  if (status !== 'granted') {
    Alert.alert('Notifications désactivées', 'Activez-les pour ne rater aucun repas !');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rappels NutriTrack',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#A3C981',
      sound: 'default',
    });
  }
  return true;
};

/**
 * Programmation des rappels quotidiens
 */
export const scheduleMealReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const meals = [
      { 
        name: 'Petit-déjeuner 🍳', 
        hour: 23, 
        minute: 20, 
        intro: "Bon réveil ! ☀️" 
      },
      { 
        name: 'Déjeuner 🥗', 
        hour: 23, 
        minute: 22, 
        intro: "C'est l'heure de la pause ! 😋" 
      },
      { 
        name: 'Dîner 🍽️', 
        hour: 23, 
        minute: 24, 
        intro: "La journée touche à sa fin... ✨" 
      },
    ];

    for (const meal of meals) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "NutriTrack 🍏", // Titre fixe
          body: `${meal.intro} N'oubliez pas de noter votre ${meal.name}.`, // Nom du repas dans le message
          sound: 'default',
          priority: 'max',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: meal.hour,
          minute: meal.minute,
        } as Notifications.DailyTriggerInput,
      });
    }
    console.log("✅ Rappels configurés : Nom du repas dans le message.");
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};