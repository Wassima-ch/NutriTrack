import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, 
         ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { analyzeMealWithAI } from '../api/GROQ_API';
import { ArrowLeft, Zap, Beef, Wheat, Droplets, Plus, 
        Calculator, CheckCircle2, Pencil, AlertTriangle 
} from 'lucide-react-native';
import CustomTabBar from '../navigation/CustomTabBar';

export default function AddMealScreen({ navigation }: any) {
  const [inputText, setInputText] = useState('');
  const [mealData, setMealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const handleCalculate = async () => {
  if (inputText.length < 2) return Alert.alert("Erreur", "Veuillez décrire votre repas.");
  setLoading(true);
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Utilisateur non authentifié");

    const userSnap = await getDoc(doc(db, "users", uid));
    const userData = userSnap.data();
    const result = await analyzeMealWithAI(inputText, userData?.preferences || [], userData?.objectif || "");
    
    if (result) {
      setMealData(result);
      if (result.warning) Alert.alert("⚠️ Attention", result.warning);
    } else {
      Alert.alert("Erreur", "L'IA n'a pas pu analyser ce texte. Essayez d'être plus précis.");
    }
  } catch (error) {
    console.error("Meal Analysis Error:", error);
    Alert.alert(
      "Erreur de Connexion", 
      "Impossible de joindre le serveur. Vérifiez votre connexion internet."
    );
  } finally {
    setLoading(false);
  }
};
  const handleSave = async () => {
    if (!mealData) return;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Erreur", "Vous devez être connecté pour enregistrer un repas.");
        return;
      }
      const now = new Date();
      const dateMaroc = now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });
      const heureMaroc = now.toLocaleTimeString('fr-FR', { 
        timeZone: 'Africa/Casablanca', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      await addDoc(collection(db, "meals"), {
        userId: uid,
        name: mealData.name,
        calories: mealData.kcal,
        proteins: mealData.prot,
        carbs: mealData.carb,
        fats: mealData.fat,
        date: dateMaroc, 
        heure: heureMaroc,
        createdAt: now.toISOString() 
      });
      navigation.navigate('History');
    } catch (error) {
      console.error("Firestore Save Error:", error);
      Alert.alert("Erreur", "Sauvegarde impossible. Vérifiez votre connexion.");
    }
  };
  return (
    <View className="flex-1 bg-fresh">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          className="flex-1"
        >
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            className="px-6"
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <View className="flex-row items-center mt-6 mb-8">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={28} color="#A3C981" />
              </TouchableOpacity>
              <Text className="text-2xl font-black ml-4 text-mainText">Ajouter un repas</Text>
            </View>
            <View className="bg-white p-6 rounded-[35px] shadow-sm border border-secondary/30">
              <View className="flex-row items-center mb-5">
                <View className="bg-primary/20 p-2.5 rounded-xl mr-3">
                  <Pencil size={18} color="#A3C981" />
                </View>
                <Text className="text-mainText font-black text-xl">Décrivez votre repas</Text>
              </View>
              <View className="bg-fresh rounded-[25px] p-4 mb-6 border border-secondary/20">
                <TextInput 
                  placeholder="Ex: 150g de viande, 200g de riz..."
                  multiline value={inputText} onChangeText={setInputText} 
                  className="text-mainText text-base min-h-[120px]" 
                  textAlignVertical="top" placeholderTextColor="#9CA3AF"
                />
              </View>
              <TouchableOpacity 
                onPress={handleCalculate} disabled={loading}
                className={`py-4 rounded-2xl flex-row justify-center items-center ${loading ? 'bg-secondary' : 'bg-primary'}`}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text className="text-white font-black text-lg mr-3">CALCULER</Text>
                    <Calculator size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
            {mealData ? (
              <View className="mt-6 bg-mainText p-8 rounded-[40px] shadow-2xl">
                <View className="items-center mb-8">
                  <View className="bg-white/10 px-4 py-1 rounded-full mb-3">
                    <Text className="text-white/60 text-[10px] font-bold uppercase tracking-[2px]">Analyse Terminée</Text>
                  </View>
                  <Text className="text-white text-3xl font-black capitalize text-center mb-3">{mealData.name}</Text>
                  {mealData.warning && (
                    <View className="bg-red-500/20 px-4 py-2 rounded-2xl mb-3 flex-row items-center justify-center border border-red-500/30 w-full">
                      <AlertTriangle size={16} color="#FF8080" />
                      <Text className="text-[#FF8080] text-[11px] font-bold ml-2 text-center">
                        {mealData.warning}
                      </Text>
                    </View>
                  )}
                  {mealData.matchObjectif && (
                    <Text className="text-primary font-bold text-[12px] italic text-center">
                      💡 {mealData.matchObjectif}
                    </Text>
                  )}
                </View>
                <View className="flex-row justify-between mb-10">
                  <MacroItem val={mealData.kcal} label="Kcal" icon={<Zap size={20} color="#FFD97D"/>} color="#FFD97D" />
                  <MacroItem val={mealData.prot} label="Prot" icon={<Beef size={20} color="#FF8080"/>} color="#FF8080" />
                  <MacroItem val={mealData.carb} label="Gluc" icon={<Wheat size={20} color="#A3C981"/>} color="#A3C981" />
                  <MacroItem val={mealData.fat} label="Lip" icon={<Droplets size={20} color="#7FBAF0"/>} color="#7FBAF0" />
                </View>

                <TouchableOpacity onPress={handleSave} className="bg-primary py-5 rounded-2xl flex-row justify-center items-center shadow-lg">
                  <Text className="text-white font-black text-lg mr-3">VALIDER LE JOURNAL</Text>
                  <Plus size={22} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              !loading && (
                <View className="mt-6 p-10 items-center justify-center bg-white rounded-[35px] border-2 border-dashed border-secondary/50">
                  <CheckCircle2 size={40} color="#D0DDC4" />
                  <Text className="text-mutedText font-bold text-center mt-4">Décrivez votre repas et cliquez sur calculer pour voir les nutriments.</Text>
                </View>
              )
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <CustomTabBar />
    </View>
  );
}
const MacroItem = ({ val, label, icon, color }: any) => (
  <View className="items-center flex-1">
    <View style={{ backgroundColor: `${color}20` }} className="p-3 rounded-2xl mb-2">{icon}</View>
    <Text className="text-white font-black text-xl">{val}</Text>
    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{label}</Text>
  </View>
);