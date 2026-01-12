import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface RecommendationProps {
  caloriesToday: number;
  bmr: number;
}
export default function Recommendation({ caloriesToday, bmr }: Readonly<RecommendationProps>) {
  const [tip, setTip] = useState("Analyse de votre journée...");
  useEffect(() => {
    const getDetailedTip = () => {
      const hour = new Date().getHours(); 
      if (caloriesToday > bmr) {
        return "Budget dépassé. Pour compenser, privilégiez les fibres (légumes verts) et une hydratation abondante.";
      }
      if (hour >= 5 && hour < 12) {
        if (caloriesToday === 0) return "C'est le matin ! Commencez par un verre d'eau et un petit-déjeuner riche en protéines.";
        return "Bon début de journée ! N'oubliez pas de rester bien hydraté avant le déjeuner.";
      }
      if (hour >= 12 && hour < 18) {
        if (caloriesToday < bmr * 0.3) return "Votre apport est faible. Une collation saine éviterait une fatigue soudaine.";
        return "Énergie stable ? Optez pour un thé vert plutôt qu'un encas sucré.";
      }
      if (hour >= 18) {
        const remaining = bmr - caloriesToday;
        if (remaining > 500) return "Il vous reste de la marge. Un dîner complet vous aidera à mieux dormir.";
        return "Le soir approche. Privilégiez un repas léger pour faciliter votre digestion.";
      }
      return "Excellent équilibre aujourd'hui ! Votre métabolisme vous remercie.";
    };
    setTip(getDetailedTip());
  }, [caloriesToday, bmr]);
  return (
    <View className="bg-secondary/10 p-5 rounded-[30px] mt-6 border border-secondary/20 flex-row items-center">
      <View className="bg-primary/20 p-2 rounded-full">
        <Sparkles size={22} color="#7FB058" />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center mb-1">
          <Text className="font-black text-primary text-[10px] uppercase tracking-widest">Conseil NutriTrack</Text>
          <View className="ml-2 h-1 w-1 bg-primary rounded-full" />
        </View>
        <Text className="text-mainText font-medium text-sm leading-5">
          {tip}
        </Text>
      </View>
    </View>
  );
}