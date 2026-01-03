import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, X, Check, Leaf, ShieldAlert, Zap, Utensils, HeartPulse } from 'lucide-react-native';

const PRESET_OPTIONS = [
  { id: 'Végétarien', icon: Leaf, label: 'Végétarien' },
  { id: 'Diabétique', icon: HeartPulse, label: 'Diabétique' },
  { id: 'Sans Gluten', icon: ShieldAlert, label: 'Sans Gluten' },
  { id: 'Halal', icon: Utensils, label: 'Halal' },
  { id: 'Keto', icon: Zap, label: 'Keto Diet' },
  { id: 'Aucun', icon: Check, label: 'Aucune' },
];

export default function SignupPrefsScreen({ route, navigation }: any) {
  const { metrics } = route.params || { metrics: {} };
  const [prefs, setPrefs] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customPref, setCustomPref] = useState('');

  const togglePref = (val: string) => {
    if (val === 'Aucun') {
      setPrefs(['Aucun']);
      return;
    }
    setPrefs(prev => {
      const filtered = prev.filter(p => p !== 'Aucun');
      return filtered.includes(val) ? filtered.filter(p => p !== val) : [...filtered, val];
    });
  };

  const handleFinish = async () => {
    try {
      const uid = auth.currentUser?.uid;
      await updateDoc(doc(db, "users", uid!), {
        ...metrics,
        preferences: prefs,
        profileComplete: true,
        updatedAt: new Date(),
      });
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert("Erreur", "Impossible de finaliser votre profil.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fresh px-6 justify-between">
      
      {/* 1. HEADER */}
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <ArrowLeft size={24} color="#A3C981" />
        </TouchableOpacity>

        <View className="items-center mt-4">
          <Text className="text-mutedText font-medium">Étape 4/4</Text>
          <Text className="text-2xl font-bold text-mainText mt-1">Vos Préférences</Text>
        </View>
      </View>

      {/* 2. CONTENU CENTRAL */}
      <ScrollView className="flex-1 mt-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="flex-row flex-wrap justify-between">
          {PRESET_OPTIONS.map((item) => {
            const isSelected = prefs.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => togglePref(item.id)}
                activeOpacity={0.8}
                style={{ width: '48%', height: 100 }}
                className={`mb-4 rounded-[30px] flex-col items-center justify-center border-2 shadow-sm ${
                  isSelected ? 'border-primary bg-white' : 'border-transparent bg-white'
                }`}
              >
                <View className={`p-2.5 rounded-xl mb-1 ${isSelected ? 'bg-secondary' : 'bg-fresh'}`}>
                   <item.icon size={22} color={isSelected ? '#1A1C1E' : '#A3C981'} />
                </View>
                <Text numberOfLines={1} className={`font-bold text-[14px] ${isSelected ? 'text-mainText' : 'text-mainText'}`}>
                  {item.label}
                </Text>
                {isSelected && (
                  <View className="absolute top-2 right-3 bg-primary rounded-full p-1">
                    <Check size={8} color="white" strokeWidth={4} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECTION ALLERGIES / CUSTOM */}
        <View className="mt-4 px-1">
          <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">
            Allergies ou autres restrictions
          </Text>
          <View className="flex-row flex-wrap">
            {prefs.filter(p => !PRESET_OPTIONS.find(o => o.id === p)).map((p) => (
              <View 
                key={p} 
                className="bg-[#E9F3E4] border border-primary/40 px-4 py-2.5 rounded-full flex-row items-center mr-2 mb-2 shadow-sm"
              >
                <Text className="text-primary font-bold text-[12px] mr-2">{p}</Text>
                <TouchableOpacity onPress={() => togglePref(p)}>
                  <View className="bg-primary/10 rounded-full p-0.5">
                    <X size={12} color="#7FB058" strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              onPress={() => setIsModalVisible(true)}
              className="border-2 border-dashed border-gray-300 px-4 py-2.5 rounded-full flex-row items-center mb-2"
            >
              <Plus size={14} color="#94A3B8" />
              <Text className="text-gray-400 font-bold text-[11px] ml-2">Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 3. FOOTER */}
      <View className="pb-8 pt-2">
        <TouchableOpacity 
          className="bg-primary py-5 rounded-[30px] shadow-xl" 
          onPress={handleFinish}
        >
          <Text className="text-white text-center font-bold text-lg uppercase tracking-widest">
            Terminer et Calculer !
          </Text>
        </TouchableOpacity>
        <Text className="text-center text-mutedText/40 text-[11px] mt-2 font-bold uppercase tracking-tighter">
          Génération de votre plan nutritionnel...
        </Text>
      </View>

      {/* 4. MODAL (Synchronisé avec SignupGoalScreen) */}
      <Modal 
        visible={isModalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
            <View className="bg-white p-8 rounded-[40px] border-2 border-secondary relative">
              
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="absolute right-6 top-6 z-10"
              >
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>

              <Text className="text-2xl font-black text-mainText text-center mb-6">Vos préférences</Text>
              
              <TextInput
                placeholder="Ex: Arachides, Soja..."
                placeholderTextColor="#CBD5E1"
                className="bg-fresh p-5 rounded-2xl mb-8 font-bold text-mainText"
                value={customPref}
                onChangeText={setCustomPref}
                autoFocus
              />

              <View className="flex-row justify-between items-center w-full">
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 py-4 rounded-2xl bg-gray-200 mr-2"
                >
                  <Text className="text-gray-500 text-center font-bold uppercase">Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    if(customPref.trim().length >= 3) {
                      togglePref(customPref.trim()); 
                      setCustomPref(''); 
                      setIsModalVisible(false); 
                    }
                  }}
                  disabled={customPref.trim().length < 3}
                  className={`flex-1 py-4 rounded-2xl ${customPref.trim().length < 3 ? 'bg-gray-300' : 'bg-primary'} ml-2`}
                >
                  <Text className="text-white text-center font-bold uppercase">Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}