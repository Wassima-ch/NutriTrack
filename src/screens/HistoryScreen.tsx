import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Utensils, ArrowLeft, Calendar, History } from 'lucide-react-native';

export default function HistoryScreen({ navigation }: any) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "meals"), 
      where("userId", "==", auth.currentUser.uid), 
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Erreur Firestore:", error);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Composant pour l'état vide (Style identique à SearchScreen)
  const EmptyHistory = () => (
    <View className="flex-1 justify-center items-center pb-24">
      <View className="bg-gray-100 p-10 rounded-full mb-6">
        <History size={80} color="#D1D5DB" />
      </View>
      <Text className="text-gray-400 text-lg font-bold text-center px-10">
        Aucun repas enregistré
      </Text>
      <Text className="text-gray-400 text-sm font-bold text-center px-10 mt-2">
        Vos consommations apparaîtront ici.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-fresh">
      {/* Header */}
      <View className="px-6 mt-6 mb-8 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color="#A3C981" />
        </TouchableOpacity>
        <Text className="text-2xl font-black ml-4 text-mainText">Historique</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#A3C981" className="mt-10" />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            paddingHorizontal: 24, 
            paddingBottom: 40,
            flexGrow: 1 // Permet de centrer le message si la liste est vide
          }}
          ListEmptyComponent={EmptyHistory}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-[30px] mb-4 flex-row items-center shadow-sm border border-secondary/20">
              <View className="bg-fresh p-4 rounded-2xl mr-4">
                <Utensils size={22} color="#A3C981" />
              </View>
              
              <View className="flex-1">
                <Text className="font-black text-lg text-mainText" numberOfLines={1}>
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Calendar size={13} color="#5B6056" />
                  <Text className="text-mutedText text-xs font-bold ml-1.5">{item.date}</Text>
                </View>
              </View>

              <View className="items-end ml-2">
                <Text className="text-primary font-black text-xl">
                  {item.calories} <Text className="text-[10px]">KCAL</Text>
                </Text>
                <Text className="text-[10px] text-mutedText font-black uppercase">
                  P:{item.proteins} G:{item.carbs} L:{item.fats}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}