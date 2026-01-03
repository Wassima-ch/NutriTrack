import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      <View className="flex-[0.8] items-center justify-center">
        <Image source={require('../../assets/logo.png')} style={{ width: 150, height: 150, resizeMode: 'contain' }} />
        <Text className="text-5xl font-bold text-primary mt-2">NutriTrack</Text>
        <Text className="text-mutedText text-lg mt-2 text-center">Mangez mieux, vivez mieux</Text>
      </View>
      <View className="space-y-4 pb-10">
        <TouchableOpacity className="bg-primary py-5 rounded-[30px] items-center" onPress={() => navigation.navigate('SignupBasic')}>
          <Text className="text-white font-bold text-lg">S'INSCRIRE</Text>
        </TouchableOpacity>
        <TouchableOpacity className="border-2 border-primary py-5 rounded-[30px] items-center" onPress={() => navigation.navigate('Login')}>
          <Text className="text-primary font-bold text-lg">SE CONNECTER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}