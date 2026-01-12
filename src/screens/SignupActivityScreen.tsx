import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sofa, Footprints, Dumbbell, Zap, Trophy } from 'lucide-react-native';

const ACTIVITY_LEVELS = [
  { 
    id: 'Sédentaire', 
    label: 'Sédentaire', 
    desc: 'Peu ou pas d\'exercice, travail de bureau', 
    icon: Sofa 
  },
  { 
    id: 'Légèrement actif', 
    label: 'Légèrement actif', 
    desc: 'Exercice léger 1 à 3 fois par semaine', 
    icon: Footprints 
  },
  { 
    id: 'Modérément actif', 
    label: 'Modérément actif', 
    desc: 'Exercice modéré 3 à 5 fois par semaine', 
    icon: Dumbbell 
  },
  { 
    id: 'Très actif', 
    label: 'Très actif', 
    desc: 'Exercice intense 6 à 7 fois par semaine', 
    icon: Zap 
  },
  { 
    id: 'Extrêmement actif', 
    label: 'Extrêmement actif', 
    desc: 'Travail physique ou entraînement 2x par jour', 
    icon: Trophy 
  },
];
export default function SignupActivityScreen({ route, navigation }: any) {
  const { metrics } = route.params || { metrics: {} };
  const [selected, setSelected] = useState('Modérément actif');
  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
        <ArrowLeft size={24} color="#A3C981" />
      </TouchableOpacity>
      <View className="items-center mt-4">
        <Text className="text-mutedText font-medium">Étape 2/4</Text>
        <Text className="text-2xl font-bold text-mainText mt-1">Votre Niveau d'Activité</Text>
      </View>
      <ScrollView 
        className="mt-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {ACTIVITY_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelected(item.id)}
            activeOpacity={0.7}
            className={`mb-3 p-4 rounded-[25px] border-2 flex-row items-center shadow-sm ${
              selected === item.id 
                ? 'border-primary bg-secondary' 
                : 'border-white bg-white'
            }`}
          >
            <View className={`p-3 rounded-2xl ${selected === item.id ? 'bg-white' : 'bg-fresh'}`}>
              <item.icon 
                size={26} 
                color={selected === item.id ? '#1A1C1E' : '#A3C981'} 
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-mainText">{item.label}</Text>
              <Text className="text-mutedText text-xs leading-4" numberOfLines={2}>
                {item.desc}
              </Text>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              selected === item.id ? 'border-primary' : 'border-secondary'
            }`}>
              {selected === item.id && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity 
        className="bg-primary py-5 rounded-[30px] mb-6 shadow-md" 
        onPress={() => navigation.navigate('SignupGoal', { 
            metrics: { ...metrics, niveauActivite: selected } 
        })}
      >
        <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">
          CONTINUER
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}