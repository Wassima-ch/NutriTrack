import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';

export default function SignupBasicScreen({ navigation }: any) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateAccount = async () => {
    if (!form.email || !form.password || !form.nom || !form.prenom) {
        return Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    }
    
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        profileComplete: false,
        createdAt: new Date().toISOString()
      });
      navigation.navigate('SignupMetrics');
    } catch (e: any) { 
        Alert.alert("Erreur", "Cet email est déjà utilisé ou le mot de passe est trop court."); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      {/* KeyboardAvoidingView permet de remonter le contenu quand le clavier s'active */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          // On ajoute un padding en bas au contenu du scroll pour permettre de remonter les champs
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
            <ArrowLeft size={24} color="#A3C981" />
          </TouchableOpacity>

          <View className="items-center mt-2">
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 80, height: 80, resizeMode: 'contain' }} 
            />
            <Text className="text-2xl font-bold text-primary">NutriTrack</Text>
          </View>

          <View className="mt-4">
            <Text className="text-3xl font-bold text-mainText">Créer un compte</Text>
            <Text className="text-mutedText mt-2">Commencez votre voyage vers une vie plus saine.</Text>
          </View>

          <View className="space-y-4 mt-6">
            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <User size={20} color="#A3C981" />
              <TextInput 
                  placeholder="Prénom" 
                  className="flex-1 ml-3 text-mainText"
                  onChangeText={(t) => setForm({...form, prenom: t})} 
              />
            </View>

            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <User size={20} color="#A3C981" />
              <TextInput 
                  placeholder="Nom" 
                  className="flex-1 ml-3 text-mainText"
                  onChangeText={(t) => setForm({...form, nom: t})} 
              />
            </View>

            {/* Quand on clique ici, KeyboardAvoidingView fera défiler automatiquement */}
            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <Mail size={20} color="#A3C981" />
              <TextInput 
                  placeholder="Email" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-mainText"
                  onChangeText={(t) => setForm({...form, email: t})} 
              />
            </View>

            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <Lock size={20} color="#A3C981" />
              <TextInput 
                  placeholder="Mot de passe" 
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-mainText"
                  onChangeText={(t) => setForm({...form, password: t})} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-2">
                {showPassword ? (
                  <EyeOff size={20} color="#CBD5E1" />
                ) : (
                  <Eye size={20} color="#A3C981" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            className={`bg-primary py-3 rounded-[30px] mt-6 shadow-md ${loading ? 'opacity-70' : ''}`} 
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">Continuer</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="mt-4 items-center" onPress={() => navigation.navigate('Login')}>
            <Text className="text-mutedText">
              Déjà un compte ? <Text className="text-primary font-bold">Se connecter</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}