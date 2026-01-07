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
    // SUPPRIMEZ cancelAllScheduledNotificationsAsync() : c'est cela qui crée des conflits
    
    const meals = [
      { id: 'meal-bk', name: 'Petit-déjeuner 🍳', hour: 17, minute: 28, intro: "Bon réveil ! ☀️" },
      { id: 'meal-ln', name: 'Déjeuner 🥗', hour: 17, minute: 29, intro: "C'est l'heure de la pause ! 😋" },
      { id: 'meal-dn', name: 'Dîner 🍽️', hour: 17, minute: 47, intro: "La journée touche à sa fin... ✨" },
    ];

    for (const meal of meals) {
      await Notifications.scheduleNotificationAsync({
        identifier: meal.id, // ID FIXE : Empêche le doublon
        content: {
          title: "NutriTrack 🍏",
          body: `${meal.intro} N'oubliez pas de noter votre ${meal.name}.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: meal.hour,
          minute: meal.minute,
        } as Notifications.DailyTriggerInput,
      });
    }
  } catch (error) { console.error('❌ Erreur:', error); }
};
/**
 * Envoie une notification immédiate en cas de dépassement
 */
export const scheduleWaterReminders = async (waterGlasses: number) => {
  try {
    // 1. Liste des rappels de 9h à 23h (8 verres)
    const reminders = [
      { id: 'water-9h',  hour: 17,  minute: 5,  target: 1 },
      { id: 'water-11h', hour: 11, minute: 0,  target: 2 },
      { id: 'water-13h', hour: 17, minute: 55,  target: 3 },
      { id: 'water-15h', hour: 17, minute: 46,  target: 4 },
      { id: 'water-17h', hour: 17, minute: 0,  target: 5 },
      { id: 'water-19h', hour: 19, minute: 0,  target: 6 },
      { id: 'water-21h', hour: 21, minute: 0,  target: 7 },
      { id: 'water-23h', hour: 23, minute: 0,  target: 8 },
    ];

    const now = new Date();

    for (const r of reminders) {
      const reminderTime = new Date();
      reminderTime.setHours(r.hour, r.minute, 0);

      // CONDITION 1 : On annule si l'objectif est déjà atteint
      if (waterGlasses >= r.target) {
        await Notifications.cancelScheduledNotificationAsync(r.id);
        continue;
      }

      // CONDITION 2 : On programme si l'heure n'est pas passée
      if (now < reminderTime) {
        const plural = waterGlasses > 1 ? 's' : '';
        
        // Votre logique de message personnalisée
        const messageBody = waterGlasses === 0 
          ? "Vous n'avez pas encore bu d'eau aujourd'hui. Commencez par un grand verre ! 🥤"
          : `Vous n'avez bu que ${waterGlasses} verre${plural}. Buvez un peu d'eau pour atteindre votre objectif ! 🥤`;

        await Notifications.scheduleNotificationAsync({
          identifier: r.id, // ID unique indispensable contre les doublons
          content: {
            title: "Hydratation 💧",
            body: messageBody,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: r.hour,
            minute: r.minute,
          } as Notifications.DailyTriggerInput,
        });
      }
    }
    console.log("✅ Planning d'eau 9h-23h synchronisé.");
  } catch (error) {
    console.error("❌ Erreur rappels eau:", error);
  }
};
export const sendKcalAlert = async (calories: number, limit: number) => {
  try {
    const depassement = Math.round(calories - limit);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerte Calories ⚠️",
        body: `Vous avez dépassé votre budget de ${depassement} kcal. Pensez à équilibrer vos prochains repas. 🥗`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Envoi immédiat
    });
  } catch (error) {
    console.error('❌ Erreur alerte kcal:', error);
  }
};
