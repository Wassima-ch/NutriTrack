const GROQ_API_KEY = "";
const URL = "https://api.groq.com/openai/v1/chat/completions";

export const analyzeMealWithAI = async (text: string, preferences: string[] = [], objectif: string = "") => {
  try {
    const prefsString = preferences.length > 0 ? preferences.join(", ") : "Aucune restriction";
    
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en nutrition. 
            PROFIL UTILISATEUR :
            - Préférences : ${prefsString}
            - Objectif : ${objectif}

            TACHE : 
            1. Estime prot, carb, fat.
            2. ALERTE : Si ingrédient interdit (ex: viande pour "Végétarien"), remplis "warning".
            3. CONSEIL : Si le repas ne correspond pas à l'objectif (ex: trop léger pour prise de masse), donne un conseil de 10 mots max dans "matchObjectif".

            Réponds UNIQUEMENT en JSON : 
            {"prot":number, "carb":number, "fat":number, "name":string, "warning":string|null, "matchObjectif":string}`
          },
          { role: "user", content: `Analyse : "${text}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const parsed = JSON.parse(data.choices[0].message.content);
      const p = Math.round(Number(parsed.prot || 0));
      const g = Math.round(Number(parsed.carb || 0));
      const l = Math.round(Number(parsed.fat || 0));

      return {
        kcal: Math.round((p * 4) + (g * 4) + (l * 9)),
        prot: p,
        carb: g,
        fat: l,
        name: parsed.name || text,
        warning: parsed.warning || null,
        matchObjectif: parsed.matchObjectif || ""
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur Groq:", error);
    return null;
  }
};