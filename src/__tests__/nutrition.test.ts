import { calculateBMR, calculateMacros } from '../utils/nutrition';

describe('Tests Unitaires : Algorithmes Nutritionnels', () => {

  // Cas 1 : Homme
  it('Calcul BMR (Homme) : Applique correctement la formule de Mifflin-St Jeor (+5)', () => {
    // Note: Sans niveau d'activité précisé, la fonction applique un facteur x1.2 par défaut
    const data = { poids: '70', taille: '175', age: '25', sexe: 'homme', objectif: 'maintien' };
    const result = calculateBMR(data);
    
    // BMR Base = 1673.75
    // Avec activité sédentaire (x1.2) = 2008.5 -> Arrondi à 2009
    expect(result).toBe(2009);
  });

  // Cas 2 : Femme
  it('Calcul BMR (Femme) : Applique l\'ajustement spécifique au genre (-161)', () => {
    const data = { poids: '60', taille: '165', age: '25', sexe: 'femme', objectif: 'maintien' };
    const result = calculateBMR(data);

    // BMR Base = 1345.25
    // Avec activité sédentaire (x1.2) = 1614.3 -> Arrondi à 1614
    expect(result).toBe(1614);
  });

  // Cas 3 : Erreurs
  it('Gestion des erreurs : Retourne 2000 par défaut si les données sont manquantes', () => {
    const result = calculateBMR(null);
    expect(result).toBe(2000);
  });

  // Cas 4 : Proportions Macros
  it('Calcul des Macros : Répartit correctement les proportions (25% P / 50% G / 25% L)', () => {
    const macros = calculateMacros(2000);
    // Protéines: (2000 * 0.25) / 4 = 125g
    // Glucides: (2000 * 0.50) / 4 = 250g
    expect(macros.proteins).toBe(125);
    expect(macros.carbs).toBe(250);
  });

  // Cas 5 : Arrondi
  it('Précision : Arrondit correctement les résultats à l\'entier le plus proche', () => {
      const macros = calculateMacros(2000);
      // Lipides: (2000 * 0.25) / 9 = 55.55... -> doit devenir 56
      expect(macros.fats).toBe(56);
  });
});