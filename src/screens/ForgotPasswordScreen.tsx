import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const handleReset = async () => {
    if (!email) {
      return Alert.alert("Erreur", "Veuillez entrer votre adresse email.");
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (error: any) {
      console.error("Reset Error:", error);
      Alert.alert("Erreur", "Cet email n'est pas reconnu ou une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>   
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
            <ArrowLeft size={24} color="#A3C981" />
          </TouchableOpacity>
          <View className="items-center mt-10">
            <View className="bg-white p-6 rounded-full shadow-sm border border-secondary mb-4">
               {isSent ? <CheckCircle2 size={50} color="#A3C981" /> : <Mail size={50} color="#A3C981" />}
            </View>
            <Text className="text-3xl font-bold text-mainText text-center">
              {isSent ? "Email Envoyé !" : "Mot de passe oublié ?"}
            </Text>
            <Text className="text-mutedText mt-2 text-center px-4">
              {isSent 
                ? `Nous avons envoyé un lien de réinitialisation à ${email}.`
                : "Entrez votre email pour recevoir un lien de réinitialisation."}
            </Text>
          </View>
          {!isSent && (
            <View className="mt-10 space-y-4">
              <View className="flex-row items-center bg-white p-3 rounded-2xl border border-secondary shadow-sm">
                <Mail size={20} color="#A3C981" />
                <TextInput 
                    placeholder="Email" 
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-3 text-mainText"
                    value={email}
                    onChangeText={setEmail} 
                />
              </View>
              <TouchableOpacity 
                className={`bg-primary py-5 rounded-[30px] mt-6 shadow-md ${loading ? 'opacity-70' : ''}`} 
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">Réinitialiser</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {isSent && (
            <TouchableOpacity 
              className="bg-white border border-primary py-5 rounded-[30px] mt-10" 
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="text-primary text-center font-bold text-lg uppercase">Retour à la connexion</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}