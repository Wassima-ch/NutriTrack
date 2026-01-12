import React, { useState, useEffect } from "react";
import {View,Text,ScrollView,TouchableOpacity,ActivityIndicator,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { generateMealPlan } from "../api/mealPlannerAI";
import { ArrowLeft, Sparkles, Target, Zap } from "lucide-react-native";
import CustomTabBar from "../navigation/CustomTabBar";

export default function MealPlannerScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  useEffect(() => {
    loadPlan();
  }, []);
  const loadPlan = async () => {
    setLoading(true);
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) return;
      const userSnap = await getDoc(doc(db, "users", userUid));
      const userData = userSnap.data();
      const result = await generateMealPlan(userData);
      setPlan(result);
    } catch (error) {
      console.error("Erreur lors de la génération du plan:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 bg-fresh">
      <SafeAreaView className="flex-1">
        <View className="px-6 py-6 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color="#A3C981" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-black text-mainText">
            Mon Coach IA
          </Text>
        </View>
        <ScrollView
          className="px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {loading ? (
            <View className="mt-20 items-center">
              <ActivityIndicator size="large" color="#A3C981" />
              <Text className="mt-4 text-mutedText font-bold">
                L'IA prépare votre menu...
              </Text>
            </View>
          ) : (
            <>
              <View className="bg-mainText p-6 rounded-[35px] mb-6 shadow-xl">
                <View className="flex-row items-center mb-4">
                  <Target color="#A3C981" size={24} />
                  <Text className="text-white font-black text-lg ml-3">
                    Objectif Quotidien
                  </Text>
                </View>
                <Text className="text-white/60 text-xs font-bold uppercase">
                  Besoin Calorique Estimé
                </Text>
                <Text className="text-primary text-4xl font-black">
                  {plan?.tdee || "--"} <Text className="text-lg">Kcal</Text>
                </Text>
              </View>
              <Text className="text-mainText font-black text-xl mb-4 italic">
                Suggestions du jour
              </Text>
              {plan?.meals?.map((meal: any) => (
                <View
                  key={meal.type}
                  className="bg-white p-5 rounded-[30px] mb-4 border border-secondary/20 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="bg-fresh px-3 py-1 rounded-full">
                      <Text className="text-primary font-bold text-[10px] uppercase">
                        {meal.type}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Zap size={14} color="#FFD97D" />
                      <Text className="text-mainText font-black ml-1">
                        {meal.kcal} kcal
                      </Text>
                    </View>
                  </View>
                  <Text className="text-mainText font-black text-lg mb-1">
                    {meal.name}
                  </Text>
                  <Text className="text-mutedText text-sm leading-5">
                    {meal.desc}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={loadPlan}
                className="bg-primary py-5 rounded-2xl flex-row justify-center items-center mt-4"
              >
                <Sparkles size={20} color="white" />
                <Text className="text-white font-black ml-3">
                  RÉGÉNÉRER LE MENU
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <CustomTabBar />
    </View>
  );
}
