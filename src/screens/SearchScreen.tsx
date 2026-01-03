import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchFood } from '../api/openFoodFacts';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Search,
  SearchX,
  ArrowLeft,
  Plus,
} from 'lucide-react-native';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const data = await searchFood(query);
      setResults(data);
    } catch (e) {
      Alert.alert("Erreur", "Recherche impossible.");
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async (item: any) => {
    try {
      const userUid = auth.currentUser?.uid;
      // CORRECTION : On utilise le format fr-FR pour que le Dashboard le détecte
      const todayStr = new Date().toLocaleDateString('fr-FR');

      await addDoc(collection(db, 'meals'), {
        userId: userUid,
        name: item.name,
        calories: Math.round(item.calories),
        proteins: item.proteins || 0,
        carbs: item.carbs || 0,
        fats: item.fats || 0,
        date: todayStr,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Succès', 'Aliment ajouté !');
      navigation.navigate('Dashboard');
    } catch (e) {
      Alert.alert('Erreur', 'Sauvegarde échouée.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fresh px-6">
      {/* Header */}
      <View className="flex-row items-center my-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color="#A3C981" />
        </TouchableOpacity>
        <Text className="text-2xl font-black ml-4 text-mainText">
          Chercher un aliment
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row bg-white rounded-2xl p-2 items-center mb-6 shadow-sm border border-gray-100">
        <TextInput
          placeholder="Ex : Yaourt, Pomme..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          className="flex-1 px-4 h-12 text-mainText"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-primary p-3 rounded-xl"
        >
          <Search size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#A3C981" className="mt-10" />
        ) : results.length > 0 ? (
          results.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => saveMeal(item)}
              className="bg-white p-4 rounded-[25px] mb-4 flex-row items-center shadow-sm"
            >
              <Image
                source={{ uri: item.image }}
                className="w-14 h-14 rounded-2xl bg-gray-50"
              />
              <View className="flex-1 ml-4">
                <Text
                  className="font-bold text-mainText text-lg"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-primary font-black">
                  {Math.round(item.calories)} kcal
                </Text>
              </View>
              <View className="bg-secondary p-2 rounded-full">
                <Plus size={20} color="#A3C981" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center pb-24">
            <View className="bg-gray-100 p-10 rounded-full mb-6">
              {hasSearched ? (
                <SearchX size={80} color="#D1D5DB" />
              ) : (
                <Search size={80} color="#D1D5DB" />
              )}
            </View>
            <Text className="text-gray-400 text-lg font-bold text-center px-10">
              {hasSearched
                ? "Aucun résultat trouvé pour votre recherche."
                : "Entrez le nom d'un produit pour afficher ses valeurs nutritionnelles."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}