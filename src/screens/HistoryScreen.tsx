import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, SectionList, ActivityIndicator, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Utensils, ArrowLeft, Calendar, History, X, Info, Clock, Flame } from 'lucide-react-native';
import CustomTabBar from '../navigation/CustomTabBar';

const EmptyHistory = () => (
  <View className="items-center mt-32">
    <View className="bg-gray-50 p-6 rounded-full">
      <History size={60} color="#D1D5DB" />
    </View>
    <Text className="text-gray-400 font-black text-lg mt-4">Aucun repas trouvé</Text>
  </View>
);
export default function HistoryScreen({ navigation }: any) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const todayStr = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });
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
    });
    return unsub;
  }, []);
  const sections = useMemo(() => {
    const groups = meals.reduce((acc, meal) => {
      const date = meal.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(meal);
      return acc;
    }, {} as Record<string, any[]>);
    Object.keys(groups).forEach(date => {
      groups[date].sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    });
    const sortedDates = Object.keys(groups).sort((a: string, b: string) => {
      if (a === todayStr) return -1;
      if (b === todayStr) return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    return sortedDates.map(date => ({
      title: date === todayStr ? "Aujourd'hui" : date,
      data: groups[date]
    }));
  }, [meals, todayStr]);
  const handleDeleteMeal = (mealId: string, mealName: string) => {
    Alert.alert(
      "Supprimer le repas",
      `Voulez-vous vraiment supprimer "${mealName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            (async () => {
              try { 
                await deleteDoc(doc(db, "meals", mealId)); 
                setSelectedMeal(null); 
              } catch (error) { 
                console.error("Delete Meal Error:", error);
                Alert.alert("Erreur", "Action impossible. Veuillez réessayer."); 
              }
            })();
          } 
        }
      ]
    );
  };
  return (
    <View className="flex-1 bg-fresh">
      <SafeAreaView className="flex-1">
        <View className="px-6 mt-6 mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#A3C981" />
            </TouchableOpacity>
            <Text className="text-2xl font-black ml-4 text-mainText">Mon Historique</Text>
          </View>
        </View>
        {loading ? (
          <View className="flex-1 justify-center">
            <ActivityIndicator size="large" color="#A3C981" />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
            renderSectionHeader={({ section: { title } }) => (
              <View className="flex-row items-center mt-8 mb-4">
                <View className="bg-primary/10 px-4 py-1.5 rounded-full flex-row items-center border border-primary/5">
                  <Calendar size={12} color="#A3C981" />
                  <Text className="ml-2 text-primary font-black uppercase text-[10px] tracking-widest">{title}</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setSelectedMeal(item)}
                className="bg-white p-4 rounded-[30px] mb-4 flex-row items-center shadow-sm border border-secondary/10"
              >
                <View className="bg-fresh p-4 rounded-2xl mr-4">
                  <Utensils size={20} color="#A3C981" />
                </View>     
                <View className="flex-1 justify-center">
                  <Text className="font-black text-lg text-mainText leading-tight mb-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row">
                    <View className="bg-primary/10 px-2 py-0.5 rounded-xl">
                      <Text className="text-primary font-black text-sm">
                        {Number(item.calories ?? 0).toFixed(1)} <Text className="text-[9px]">KCAL</Text>
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="items-end justify-between min-h-[50px]">
                  <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Text className="text-[9px] text-mutedText font-black uppercase">
                      P:{Number(item.proteins ?? 0).toFixed(1)} G:{Number(item.carbs ?? 0).toFixed(1)} L:{Number(item.fats ?? 0).toFixed(1)}
                    </Text>
                  </View>
                  <Info size={16} color="#D1D5DB" className="mt-2" />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={EmptyHistory}
          />
        )}
        <Modal
          visible={!!selectedMeal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedMeal(null)}
        >
          <Pressable 
            className="flex-1 bg-black/40 justify-end" 
            onPress={() => setSelectedMeal(null)}
          >
            <Pressable className="bg-white rounded-t-[40px] p-8 shadow-2xl">
              <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />   
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                  <Text className="text-mutedText text-[10px] uppercase font-black tracking-widest mb-1">Détails du repas</Text>
                  <Text className="text-3xl font-black text-mainText leading-tight">{selectedMeal?.name}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedMeal(null)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between mb-8">
                <View className="items-center flex-1 border-r border-gray-100">
                  <Flame size={20} color="#A3C981" />
                  <Text className="font-black text-lg mt-1">{Number(selectedMeal?.calories ?? 0).toFixed(1)}</Text>
                  <Text className="text-[10px] text-mutedText uppercase font-bold">Calories</Text>
                </View>
                <View className="items-center flex-1 border-r border-gray-100 ">
                  <Clock size={20} color="#A3C981" />
                  <Text className="font-black text-lg mt-1 text-mainText" numberOfLines={1}>
                    {selectedMeal?.date === todayStr ? "Aujourd'hui" : selectedMeal?.date}
                  </Text>
                  <Text className="text-[10px] text-mutedText uppercase font-bold tracking-tighter">Date</Text>
                </View>
                <View className="items-center flex-1">
                  <Utensils size={20} color="#A3C981" />
                  <Text className="font-black text-lg mt-1">
                    {(Number(selectedMeal?.proteins ?? 0) + Number(selectedMeal?.carbs ?? 0) + Number(selectedMeal?.fats ?? 0)).toFixed(1)}g
                  </Text>
                  <Text className="text-[10px] text-mutedText uppercase font-bold">Total Macros</Text>
                </View>
              </View>
              <View className="bg-fresh rounded-[30px] p-6 mb-8 border border-primary/10">
                <View className="flex-row justify-between items-center mb-4">
                   <Text className="font-black text-mainText italic">Répartition nutritive</Text>
                </View>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-primary/10 mb-2">
                      <Text className="text-primary font-black">{Number(selectedMeal?.proteins ?? 0).toFixed(1)}g</Text>
                    </View>
                    <Text className="text-[9px] font-black uppercase text-mutedText">Protéines</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-yellow-100 mb-2">
                      <Text className="text-yellow-500 font-black">{Number(selectedMeal?.carbs ?? 0).toFixed(1)}g</Text>
                    </View>
                    <Text className="text-[9px] font-black uppercase text-mutedText">Glucides</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-red-100 mb-2">
                      <Text className="text-red-400 font-black">{Number(selectedMeal?.fats ?? 0).toFixed(1)}g</Text>
                    </View>
                    <Text className="text-[9px] font-black uppercase text-mutedText">Lipides</Text>
                  </View>
                </View>
              </View>
              {selectedMeal?.date === todayStr && (
                <TouchableOpacity 
                  onPress={() => handleDeleteMeal(selectedMeal.id, selectedMeal.name)}
                  className="bg-red-50 py-4 rounded-2xl flex-row justify-center items-center border border-red-100"
                >
                  <X size={16} color="#FF8080" className="mr-2" strokeWidth={3} />
                  <Text className="text-red-400 font-black uppercase text-xs tracking-widest">Supprimer</Text>
                </TouchableOpacity>
              )}
              <View className="h-10" />
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
      <CustomTabBar />
    </View>
  );
}