export const calculateBMR = (userData: any) => {
  if (!userData) return 2000;
  const weight = Number.parseFloat(userData.poids);
  const height = Number.parseFloat(userData.taille);
  const age = Number.parseInt(userData.age, 10);
  const gender = userData.sexe || userData.genre || "";
  const activityLevel = userData.niveauActivite || "";
  const goal = userData.objectif ? userData.objectif.trim().toLowerCase() : "";
  if (Number.isNaN(weight) || Number.isNaN(height) || Number.isNaN(age)) return 2000;
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  const isMale = gender.toLowerCase().includes('hom') || gender.toLowerCase().includes('masc');
  bmr = isMale ? bmr + 5 : bmr - 161;
  const multipliers: { [key: string]: number } = {
    'sédentaire': 1.2,
    'légèrement actif': 1.375,
    'modérément actif': 1.55,
    'très actif': 1.725,
    'extrêmement actif': 1.9
  };
  const activityKey = activityLevel.toLowerCase();
  let tdee = bmr * (multipliers[activityKey] || 1.2);
  if (goal.includes('perte')) {
    tdee -= 500;
  } else if (goal.includes('prise')) {
    tdee += 500; 
  }
  return Math.round(tdee);
};
export const calculateMacros = (totalCalories: number) => {
  return {
    proteins: Math.round((totalCalories * 0.25) / 4),
    carbs: Math.round((totalCalories * 0.5) / 4), 
    fats: Math.round((totalCalories * 0.25) / 9)
  };
};
  // 1. Calcul du Métabolisme de Base (BMR) - Formule de Mifflin-St Jeor
  // Homme: (10 × poids) + (6.25 × taille) - (5 × âge) + 5
  // Femme: (10 × poids) + (6.25 × taille) - (5 × âge) - 161