import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, UserRound } from 'lucide-react-native';

export default function SignupMetricsScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState({ sexe: 'Homme', age: '', taille: '', poids: '' });

  const handleContinue = () => {
    if (!metrics.age.trim() || !metrics.taille.trim() || !metrics.poids.trim()) {
      Alert.alert("Champs incomplets", "Veuillez remplir tous les champs pour continuer.");
      return;
    }

    const ageNum = parseInt(metrics.age);
    const tailleNum = parseInt(metrics.taille);
    const poidsNum = parseFloat(metrics.poids.replace(',', '.'));

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 100) {
      Alert.alert("Âge invalide", "L'âge doit être compris entre 0 et 100 ans.");
      return;
    }

    if (isNaN(tailleNum) || tailleNum < 40 || tailleNum > 250) {
      Alert.alert("Taille invalide", "La taille doit être comprise entre 40 et 250 cm.");
      return;
    }

    if (isNaN(poidsNum) || poidsNum < 2 || poidsNum > 300) {
      Alert.alert("Poids invalide", "Le poids doit être compris entre 2 et 300 kg.");
      return;
    }
    
    navigation.navigate('SignupActivity', { 
      metrics: {
        ...metrics,
        age: ageNum,
        taille: tailleNum,
        poids: poidsNum
      } 
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      {/* 1. Ajout de KeyboardAvoidingView pour gérer la montée de l'écran */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <ArrowLeft size={24} color="#A3C981" />
        </TouchableOpacity>

        <View className="items-center mt-4">
          <Text className="text-mutedText font-medium">Étape 1/4</Text>
          <Text className="text-2xl font-bold text-mainText mt-1">Vos Métriques</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="mt-8"
          // 2. paddingBottom important pour laisser de la place au défilement
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          {/* Sélection du Genre */}
          <View className="flex-row space-x-4 mb-6">
            <TouchableOpacity 
              onPress={() => setMetrics({...metrics, sexe: 'Homme'})} 
              className={`flex-1 p-5 rounded-[25px] border-2 items-center ${metrics.sexe === 'Homme' ? 'border-primary bg-secondary' : 'bg-white border-white'}`}
            >
              <User size={30} color={metrics.sexe === 'Homme' ? '#1A1C1E' : '#A3C981'} />
              <Text className="text-center font-bold mt-2">Homme</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setMetrics({...metrics, sexe: 'Femme'})} 
              className={`flex-1 p-5 rounded-[25px] border-2 items-center ${metrics.sexe === 'Femme' ? 'border-primary bg-secondary' : 'bg-white border-white'}`}
            >
              <UserRound size={30} color={metrics.sexe === 'Femme' ? '#1A1C1E' : '#A3C981'} />
              <Text className="text-center font-bold mt-2">Femme</Text>
            </TouchableOpacity>
          </View>

          {/* Champs de saisie */}
          <View className="space-y-4">
            <View>
              <Text className="text-mutedText mb-2 ml-2">Âge (ans)</Text>
              <TextInput 
                placeholder="Ex: 25" 
                keyboardType="number-pad" 
                maxLength={3}
                className="bg-white p-4 rounded-2xl border border-secondary text-mainText font-bold" 
                value={metrics.age}
                onChangeText={(v) => setMetrics({...metrics, age: v.replace(/[^0-9]/g, '')})} 
              />
            </View>

            <View>
              <Text className="text-mutedText mb-2 ml-2">Taille (cm)</Text>
              <TextInput 
                placeholder="Ex: 175" 
                keyboardType="number-pad" 
                maxLength={3}
                className="bg-white p-4 rounded-2xl border border-secondary text-mainText font-bold" 
                value={metrics.taille}
                onChangeText={(v) => setMetrics({...metrics, taille: v.replace(/[^0-9]/g, '')})} 
              />
            </View>

            <View>
              <Text className="text-mutedText mb-2 ml-2">Poids actuel (kg)</Text>
              <TextInput 
                placeholder="Ex: 70.5" 
                keyboardType="decimal-pad" 
                maxLength={5}
                className="bg-white p-4 rounded-2xl border border-secondary text-mainText font-bold" 
                value={metrics.poids}
                onChangeText={(v) => setMetrics({...metrics, poids: v.replace(',', '.')})} 
              />
            </View>
          </View>

          {/* Bouton Continuer */}
          <TouchableOpacity 
            className="bg-primary py-5 rounded-[30px] mt-10 shadow-sm" 
            onPress={handleContinue}
          >
            <Text className="text-white text-center font-bold text-lg tracking-widest">
              CONTINUER
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}