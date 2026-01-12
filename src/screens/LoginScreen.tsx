import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    }
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      if (userDoc.exists() && userDoc.data().profileComplete) {
        navigation.replace('Dashboard');
      } else {
        navigation.replace('SignupMetrics');
      }
    } catch (error: any) {
      console.error("Login Error:", error.code, error.message);
      if (error.code === 'auth/network-request-failed') {
        Alert.alert("Erreur de connexion", "Veuillez vérifier votre connexion internet.");
      } else {
        Alert.alert("Erreur", "Email ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-fresh">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
        >
          <TouchableOpacity 
            onPress={() => navigation.navigate('Welcome')} 
            className="mt-4"
          >
            <ArrowLeft size={24} color="#A3C981" />
          </TouchableOpacity>
          <View className="items-center mt-2">
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 80, height: 80, resizeMode: 'contain' }} 
            />
            <Text className="text-2xl font-bold text-primary">NutriTrack</Text>
          </View>
          <View className="mt-6">
            <Text className="text-3xl font-bold text-mainText">Bon retour !</Text>
            <Text className="text-mutedText mt-2">Connectez-vous pour continuer votre suivi.</Text>
          </View>
          <View className="space-y-4 mt-6">
            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <Mail size={20} color="#A3C981" />
              <TextInput 
                placeholder="Email" 
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-mainText"
                onChangeText={setEmail} 
              />
            </View>
            <View className="flex-row items-center bg-white p-2 rounded-2xl border border-secondary shadow-sm">
              <Lock size={20} color="#A3C981" />
              <TextInput 
                placeholder="Mot de passe" 
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-mainText"
                onChangeText={setPassword} 
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="pr-2"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#CBD5E1" />
                ) : (
                  <Eye size={20} color="#A3C981" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              className="items-end px-1" 
              onPress={() => navigation.navigate('ForgotPassword')} 
            >
              <Text className="text-primary font-medium text-sm">Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            className={`bg-primary py-5 rounded-[30px] mt-8 shadow-md ${loading ? 'opacity-70' : ''}`} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">Se connecter</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity className="mt-6 mb-10 items-center" onPress={() => navigation.navigate('SignupBasic')}>
            <Text className="text-mutedText">
              Nouveau ici ? <Text className="text-primary font-bold">Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}