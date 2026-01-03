export const calculateBMR = (userData: any) => {
  if (!userData) return 2000;

  const weight = parseFloat(userData.poids);
  const height = parseFloat(userData.taille);
  const age = parseInt(userData.age);
  const gender = userData.sexe || userData.genre || "";
  const activityLevel = userData.niveauActivite || "";
  
  // Nettoyage de l'objectif (important pour éviter le bug du 1876 kcal)
  const goal = userData.objectif ? userData.objectif.trim().toLowerCase() : "";

  if (isNaN(weight) || isNaN(height) || isNaN(age)) return 2000;

  // 1. Calcul du Métabolisme de Base (BMR) - Mifflin-St Jeor
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  
  // Gestion robuste du genre
  const isMale = gender.toLowerCase().includes('hom') || gender.toLowerCase().includes('masc');
  bmr = isMale ? bmr + 5 : bmr - 161;

  // 2. Facteur d'activité (TDEE)
  const multipliers: { [key: string]: number } = {
    'sédentaire': 1.2,
    'légèrement actif': 1.375,
    'modérément actif': 1.55,
    'très actif': 1.725,
    'extrêmement actif': 1.9
  };

  // On cherche la clé en minuscule
  const activityKey = activityLevel.toLowerCase();
  let tdee = bmr * (multipliers[activityKey] || 1.2);

  // 3. Ajustement selon l'objectif (CORRIGÉ)
  // Utilisation de .includes pour capter "Prise de masse" ou "Perte de poids"
  if (goal.includes('perte')) {
    tdee -= 500;
  } else if (goal.includes('prise')) {
    tdee += 500; // Augmenté à 500 pour une prise de masse efficace
  }

  return Math.round(tdee);
};

export const calculateMacros = (totalCalories: number) => {
  // Répartition optimisée Prise de Masse : 25% Protéines, 50% Glucides, 25% Lipides
  return {
    proteins: Math.round((totalCalories * 0.25) / 4),
    carbs: Math.round((totalCalories * 0.50) / 4),
    fats: Math.round((totalCalories * 0.25) / 9)
  };
};

  // 1. Calcul du Métabolisme de Base (BMR) - Formule de Mifflin-St Jeor
  // Homme: (10 × poids) + (6.25 × taille) - (5 × âge) + 5
  // Femme: (10 × poids) + (6.25 × taille) - (5 × âge) - 161