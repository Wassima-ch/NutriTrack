import { calculateBMR, calculateMacros } from '../utils/nutrition';

describe('Tests Unitaires: Nutrition Utils', () => {

  // --- Groupe de tests pour le calcul du BMR ---
  describe('calculateBMR', () => {
    
    // Cas 1: Un homme standard, activité modérée, maintien
    it('calcule correctement pour un homme (Mifflin-St Jeor)', () => {
      const mockUser = {
        poids: '80',       // String comme dans vos inputs de formulaire
        taille: '180',
        age: '25',
        sexe: 'homme',
        niveauActivite: 'modérément actif', // Facteur 1.55
        objectif: 'maintien'
      };

      // Calcul manuel attendu :
      // BMR = (10*80) + (6.25*180) - (5*25) + 5 = 800 + 1125 - 125 + 5 = 1805
      // TDEE = 1805 * 1.55 = 2797.75
      // Arrondi = 2798
      expect(calculateBMR(mockUser)).toBe(2798);
    });

    // Cas 2: Une femme, sédentaire, perte de poids
    it('calcule correctement pour une femme avec objectif perte de poids', () => {
      const mockUser = {
        poids: '60',
        taille: '165',
        age: '30',
        sexe: 'femme',
        niveauActivite: 'sédentaire', // Facteur 1.2
        objectif: 'perte de poids'    // -500 kcal
      };

      // Calcul manuel attendu :
      // BMR = (10*60) + (6.25*165) - (5*30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      // TDEE = 1320.25 * 1.2 = 1584.3
      // Objectif = 1584.3 - 500 = 1084.3
      // Arrondi = 1084
      expect(calculateBMR(mockUser)).toBe(1084);
    });

    // Cas 3: Prise de masse (Vérification de l'ajout des 500 kcal)
    it('ajoute 500 calories pour la prise de masse', () => {
      const mockUser = {
        poids: '70',
        taille: '175',
        age: '25',
        sexe: 'homme',
        niveauActivite: 'sédentaire', // 1.2
        objectif: 'prise de masse'
      };
      
      const result = calculateBMR(mockUser);
      // On vérifie juste que c'est supérieur à 2000 (valeur par défaut)
      // BMR = 700 + 1093.75 - 125 + 5 = 1673.75
      // TDEE = 1673.75 * 1.2 = 2008.5
      // Objectif = 2008.5 + 500 = 2508.5 -> 2509
      expect(result).toBe(2509);
    });

    // Cas 4: Données invalides (Protection contre les crashs)
    it('retourne 2000 par défaut si les données sont manquantes ou invalides', () => {
      expect(calculateBMR(null)).toBe(2000);
      expect(calculateBMR({})).toBe(2000);
      expect(calculateBMR({ poids: 'abc' })).toBe(2000);
    });
  });

  // --- Groupe de tests pour le calcul des Macros ---
  describe('calculateMacros', () => {
    it('répartit correctement les macros (25% P / 50% G / 25% L)', () => {
      const calories = 2000;
      const result = calculateMacros(calories);

      // Protéines: (2000 * 0.25) / 4 = 125g
      // Glucides: (2000 * 0.50) / 4 = 250g
      // Lipides:  (2000 * 0.25) / 9 = 55.55 -> 56g
      
      expect(result).toEqual({
        proteins: 125,
        carbs: 250,
        fats: 56
      });
    });
  });
});