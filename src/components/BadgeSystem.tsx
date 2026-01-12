import React from 'react';
import { View, Text } from 'react-native';
import { Award, Zap, Target, Heart, ShieldCheck } from 'lucide-react-native';

interface BadgeProps {
  totalMeals: number;
  streak: number;
  goalReachedToday: boolean;
  perfectWeek: boolean;
}
export const BadgeSystem = ({ totalMeals, streak, goalReachedToday, perfectWeek }: BadgeProps) => {
  const badges = [
    { 
      id: 1, 
      label: "Actif", 
      icon: Zap, 
      condition: totalMeals >= 3, 
      color: "#A3C981" 
    },
    { 
      id: 2, 
      label: "Objectif", 
      icon: Target, 
      condition: goalReachedToday, 
      color: "#7FBAF0" 
    },
    { 
      id: 3, 
      label: `Série ${streak}j`, 
      icon: Award, 
      condition: streak >= 3, 
      color: "#FFD97D" 
    },
    { 
      id: 4, 
      label: "Discipline", 
      icon: ShieldCheck, 
      condition: perfectWeek, 
      color: "#FF8080" 
    },
    { 
      id: 5, 
      label: "Fidèle", 
      icon: Heart, 
      condition: totalMeals >= 50, 
      color: "#C084FC" 
    },
  ];
  return (
    <View className="mt-6 mb-2">
      <Text className="text-mainText font-black text-lg mb-3 italic tracking-tight">
        Mes Badges
      </Text>
      <View className="flex-row justify-between items-center bg-gray-100/40 p-2.5 rounded-[32px] border border-white/60 shadow-sm">
        {badges.map((badge) => (
          <View key={badge.id} className="items-center" style={{ width: '19%' }}>
            <View 
              className={`w-12 h-12 items-center justify-center rounded-2xl mb-1.5 ${
                badge.condition ? 'bg-white shadow-md' : 'bg-gray-200/50 opacity-30'
              }`}
              style={badge.condition ? { 
                borderWidth: 1.5, 
                borderColor: `${badge.color}40` 
              } : {}}
            >
              <badge.icon 
                size={22} 
                color={badge.condition ? badge.color : "#6B7280"} 
              />
            </View>
            <Text 
              numberOfLines={1} 
              style={{ fontSize: 10 }}
              className={`font-black text-center uppercase tracking-tighter ${
                badge.condition ? 'text-mainText' : 'text-gray-400'
              }`}
            >
              {badge.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
export default BadgeSystem;