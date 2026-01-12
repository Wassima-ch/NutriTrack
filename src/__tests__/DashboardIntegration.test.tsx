import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../screens/DashboardScreen';

// --------------------------------------------------------
// 1. MOCK DES DÉPENDANCES (Pour isoler les composants)
// --------------------------------------------------------

// On mock Firebase (Auth et Firestore)
jest.mock('../config/firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123' } },
  db: {} // Objet vide suffisant car on mock les fonctions firestore ci-dessous
}));

// On mock les fonctions de Firestore utilisées dans le Dashboard
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  // Le plus important : onSnapshot simule la réception de données
  onSnapshot: jest.fn((queryOrRef, callback) => {
    // On simule des données immédiates quand le composant se charge
    callback({
      // Simulation pour les repas (Calcul des totaux)
      forEach: (fn: any) => {
        // On simule 3 gros repas pour dépasser le budget
        fn({ data: () => ({ calories: 1000, proteins: 30, carbs: 100, fats: 20 }) });
        fn({ data: () => ({ calories: 1000, proteins: 30, carbs: 100, fats: 20 }) });
        fn({ data: () => ({ calories: 1000, proteins: 30, carbs: 100, fats: 20 }) });
        // TOTAL = 3000 Calories
      },
      // Simulation pour le User Data (Calcul du BMR)
      data: () => ({
        prenom: 'Mariam',
        poids: '60', // Données qui donneront un BMR autour de 1500-2000
        taille: '165',
        age: '25',
        sexe: 'femme',
        objectif: 'maintien'
      }),
      exists: () => true, // Pour l'eau
      size: 10 // Pour les stats
    });
    return () => {}; // Fonction de nettoyage (unsubscribe)
  })
}));

// On mock le service de notification pour éviter des erreurs
jest.mock('../services/NotificationService', () => ({
  requestNotificationPermissions: jest.fn(() => Promise.resolve(true)),
  scheduleMealReminders: jest.fn(),
  scheduleWaterReminders: jest.fn(),
  sendKcalAlert: jest.fn()
}));

// On mock les icônes pour éviter les erreurs de rendu graphique
jest.mock('lucide-react-native', () => ({
  Sparkles: () => 'Icon', // <--- C'EST CA QU'IL MANQUAIT !
  Flame: () => 'Icon', 
  Home: () => 'Icon', 
  BookOpen: () => 'Icon', 
  ScanLine: () => 'Icon', 
  Activity: () => 'Icon', 
  BarChart3: () => 'Icon',
  Search: () => 'Icon', 
  ChevronRight: () => 'Icon', 
  Calendar: () => 'Icon',
  Clock: () => 'Icon', 
  Target: () => 'Icon', 
  User: () => 'Icon',
  ChefHat: () => 'Icon', 
  Droplets: () => 'Icon', 
  Plus: () => 'Icon'
}));
// jest.mock('lucide-react-native', () => {
//   const { View } = require('react-native');
//   return new Proxy({}, {
//     get: () => (props) => <View {...props} />
//   });
// });

// On mock le composant BadgeSystem car ce n'est pas le sujet du test
jest.mock('../components/BadgeSystem', () => ({
  BadgeSystem: () => 'BadgeSystemMock'
}));


// --------------------------------------------------------
// 2. LE TEST D'INTÉGRATION
// --------------------------------------------------------

describe('Intégration Dashboard -> Recommendation', () => {

  it('affiche une alerte "Budget dépassé" dans le composant enfant quand les calories sont trop hautes', async () => {
    
    // 1. Rendu du Dashboard (Le Parent)
    // On passe une fausse navigation car le composant l'attend
    const mockNavigation = { navigate: jest.fn() };
    render(<DashboardScreen navigation={mockNavigation} />);

    // 2. Vérification de l'état initial (Le chargement)
    // Le dashboard commence souvent par un loader, on peut attendre qu'il disparaisse
    // ou vérifier directement le texte si le mock est instantané.

    // 3. Vérification de l'Intégration
    // On cherche le texte spécifique généré par l'enfant (AIRecommendation)
    // Rappel : On a simulé 3000 calories via le mock Firestore.
    // Le BMR calculé pour une femme de 60kg est < 2000.
    // Donc 3000 > BMR -> Le message doit être "Budget dépassé".

    await waitFor(() => {
      // getByText va chercher dans tout l'écran. 
      // Si ce texte est trouvé, ça veut dire que le Parent a bien passé 3000 à l'Enfant.
      expect(screen.getByText(/Budget dépassé/i)).toBeTruthy();
    });

    // 4. Vérification bonus (On vérifie que le nom du User mocké s'affiche aussi)
    expect(screen.getByText('Mariam')).toBeTruthy();
  });

});