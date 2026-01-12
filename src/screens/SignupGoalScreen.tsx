import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingDown, Target, Zap, Plus, Check, Trophy, X } from 'lucide-react-native';

const INITIAL_GOALS = [
  { id: 'Perte de poids', label: 'Perte de poids', desc: 'Brûler les graisses sainement', icon: TrendingDown },
  { id: 'Maintien', label: 'Maintien', desc: 'Équilibrer apports et dépenses', icon: Target },
  { id: 'Prise de masse', label: 'Prise de masse', desc: 'Optimiser la croissance musculaire', icon: Zap },
];
export default function SignupGoalScreen({ route, navigation }: any) {
  const { metrics } = route.params || { metrics: {} };
  const [selected, setSelected] = useState('Maintien');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [hasCustomGoal, setHasCustomGoal] = useState(false);
  const handleAddCustomGoal = () => {
    if (customTitle.trim().length >= 3) {
      setHasCustomGoal(true);
      setSelected(customTitle.trim()); 
      setIsModalVisible(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
        <ArrowLeft size={24} color="#A3C981" />
      </TouchableOpacity>
      <View className="items-center mt-4">
        <Text className="text-mutedText font-medium">Étape 3/4</Text>
        <Text className="text-2xl font-bold text-mainText mt-1">Votre Objectif</Text>
      </View>
      <ScrollView className="mt-10" showsVerticalScrollIndicator={false}>
        {hasCustomGoal && (
          <TouchableOpacity
            onPress={() => setSelected(customTitle)}
            className={`mb-4 p-5 rounded-[30px] flex-row items-center bg-white shadow-sm border-2 ${selected === customTitle ? 'border-primary' : 'border-transparent'}`}
          >
            <View className={`p-3 rounded-2xl ${selected === customTitle ? 'bg-secondary' : 'bg-fresh'}`}>
              <Trophy size={24} color={selected === customTitle ? '#1A1C1E' : '#A3C981'} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-mainText">{customTitle}</Text>
              <Text className="text-mutedText text-xs italic">{customDesc.trim() || 'Objectif personnel'}</Text>
            </View>
            {selected === customTitle && <View className="bg-primary rounded-full p-1.5"><Check size={14} color="white" /></View>}
          </TouchableOpacity>
        )}
        {INITIAL_GOALS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelected(item.id)}
            className={`mb-4 p-5 rounded-[30px] flex-row items-center bg-white shadow-sm border-2 ${selected === item.id ? 'border-primary' : 'border-transparent'}`}
          >
            <View className={`p-3 rounded-2xl ${selected === item.id ? 'bg-secondary' : 'bg-fresh'}`}>
              <item.icon size={24} color={selected === item.id ? '#1A1C1E' : '#A3C981'} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-mainText">{item.label}</Text>
              <Text className="text-mutedText text-xs">{item.desc}</Text>
            </View>
            {selected === item.id && <View className="bg-primary rounded-full p-1.5"><Check size={14} color="white" /></View>}
          </TouchableOpacity>
        ))}
        {!hasCustomGoal && (
          <TouchableOpacity onPress={() => setIsModalVisible(true)} className="flex-row items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-[30px] mt-2">
            <Plus size={20} color="#94A3B8" />
            <Text className="ml-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Objectif personnalisé</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <TouchableOpacity 
        className="bg-primary py-5 rounded-[30px] mb-6 shadow-xl" 
        onPress={() => navigation.navigate('SignupPrefs', { 
          metrics: { ...metrics, objectif: selected }
        })}
      >
        <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">Continuer</Text>
      </TouchableOpacity>
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
              <Text className="text-2xl font-black text-mainText text-center mb-6">Votre objectif</Text>
              <TextInput
                placeholder="Titre (ex: Courir 10km)"
                className="bg-fresh p-5 rounded-2xl mb-4 font-bold"
                value={customTitle}
                onChangeText={setCustomTitle}
              />
              <TextInput
                placeholder="Description (optionnel)"
                className="bg-fresh p-5 rounded-2xl mb-8 font-medium text-mutedText"
                value={customDesc}
                onChangeText={setCustomDesc}
              />
              <View className="flex-row justify-between items-center w-full">
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 py-4 rounded-2xl bg-gray-200 mr-2"
                >
                  <Text className="text-gray-500 text-center font-bold uppercase">Fermer</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddCustomGoal}
                  disabled={customTitle.trim().length < 3}
                  className={`flex-1 py-4 rounded-2xl ${customTitle.trim().length < 3 ? 'bg-gray-300' : 'bg-primary'} ml-2`}
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