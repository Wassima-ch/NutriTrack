
import { calculateBMR } from '../utils/nutrition';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const URL = "https://api.groq.com/openai/v1/chat/completions";

export const generateMealPlan = async (userData: any) => {
  const finalBudget = calculateBMR(userData);
  const preferences = userData.preferences || [];
  const objectif = userData.objectif || "Non défini";
  const systemPrompt = `
    Tu es un coach nutritionnel expert.
    CONTEXTE :
    - Budget Calories Total : ${finalBudget} kcal
    - Objectif : ${objectif}
    - Restrictions : ${preferences.join(", ")}
    TACHE :
    1. Génère un menu de 3 repas.
    2. La somme totale des calories des 3 repas doit être proche de ${finalBudget} kcal.
    3. Si l'objectif est "Prise de masse", favorise des repas denses en nutriments.
    RETOURNE UNIQUEMENT CE JSON :
    {
      "tdee": ${finalBudget},
      "meals": [
        {"type": "Petit-déjeuner", "name": string, "kcal": number, "desc": string},
        {"type": "Déjeuner", "name": string, "kcal": number, "desc": string},
        {"type": "Dîner", "name": string, "kcal": number, "desc": string}
      ]
    }
  `;
  const response = await fetch(URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" }
    })
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};