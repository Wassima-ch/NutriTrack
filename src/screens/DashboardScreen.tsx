import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { doc, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { 
  Flame, Home, BookOpen, ScanLine, Activity, BarChart3, 
  Search, ChevronRight, Calendar, Clock, Target, User, 
  ChefHat
} from 'lucide-react-native';

import { calculateBMR, calculateMacros } from '../utils/nutrition';
import AIRecommendation from '../components/AIRecommendation'; 

const MacroBar = ({ label, current, target, color }: any) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-1">
      <Text className="text-mutedText font-bold text-[10px] uppercase">{label}</Text>
      <Text className="text-mainText font-black text-xs">{Math.round(current)}g / {target}g</Text>
    </View>
    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <View style={{ width: `${Math.min((current/target)*100, 100)}%`, backgroundColor: color }} className="h-full rounded-full" />
    </View>
  </View>
);

export default function DashboardScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [totals, setTotals] = useState({ calories: 0, proteins: 0, carbs: 0, fats: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  
  const todayMaroc = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { 
        timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit' 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);

    const userUid = auth.currentUser?.uid;
    if (!userUid) return;

    const unsubUser = onSnapshot(doc(db, "users", userUid), (snap) => setUserData(snap.data()));
    const qToday = query(collection(db, "meals"), where("userId", "==", userUid), where("date", "==", todayMaroc));
    const unsubToday = onSnapshot(qToday, (snap) => {
      let sum = { calories: 0, proteins: 0, carbs: 0, fats: 0 };
      snap.forEach(d => {
        const m = d.data();
        sum.calories += Number(m.calories || 0);
        sum.proteins += Number(m.proteins || 0);
        sum.carbs += Number(m.carbs || 0);
        sum.fats += Number(m.fats || 0);
      });
      setTotals(sum);
    });

    const qWeek = query(collection(db, "meals"), where("userId", "==", userUid), orderBy("createdAt", "desc"), limit(50));
    const unsubWeek = onSnapshot(qWeek, (snap) => {
      const daysMap: any = {};
      snap.forEach(d => { const m = d.data(); daysMap[m.date] = (daysMap[m.date] || 0) + (m.calories || 0); });
      const last7 = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i);
        const k = d.toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });
        return { day: d.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Africa/Casablanca' }), kcal: daysMap[k] || 0 };
      }).reverse();
      setWeeklyData(last7);
      setLoading(false);
    });

    return () => { clearInterval(timer); unsubUser(); unsubToday(); unsubWeek(); };
  }, [todayMaroc]);

  const dailyBudget = calculateBMR(userData);
  const macroTargets = calculateMacros(dailyBudget);

  if (loading) return <View className="flex-1 bg-fresh justify-center items-center"><ActivityIndicator color="#A3C981" /></View>;

  return (
    <View className="flex-1 bg-fresh">
      <SafeAreaView className="flex-1 px-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View className="mt-8 mb-4 flex-row justify-between items-start">
            <View>
              <Text className="text-mutedText text-lg font-medium">Bonjour 👋</Text>
              <Text className="text-4xl font-black text-mainText">{userData?.prenom || 'User'}</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center bg-white/50 px-3 py-1 rounded-full border border-secondary/10 mb-1">
                <Calendar size={12} color="#7FB058" /><Text className="ml-1 text-primary font-bold text-[11px]">{todayMaroc}</Text>
              </View>
              <View className="flex-row items-center bg-white/50 px-3 py-1 rounded-full border border-secondary/10">
                <Clock size={12} color="#7FB058" /><Text className="ml-1 text-primary font-bold text-[11px]">{currentTime}</Text>
              </View>
            </View>
          </View>

          <View className="bg-primary rounded-[40px] p-8 mt-4 shadow-xl shadow-primary/30 relative overflow-hidden">
             <View className="z-10">
                <View className="flex-row items-center mb-2"><Flame size={20} color="white" /><Text className="text-white text-lg ml-2 font-medium">Budget Calories</Text></View>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-5xl font-black">{dailyBudget}</Text>
                  <Text className="text-white opacity-80 text-lg ml-2">kcal / jour</Text>
                </View>
             </View>
             <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
          </View>

          <AIRecommendation caloriesToday={totals.calories} bmr={dailyBudget} />

          {/* SUIVI NUTRITIF AVEC CONSOMMÉ ET RESTANT */}
          <View className="bg-white p-6 rounded-[35px] mt-6 border border-secondary/10 shadow-sm">
            <View className="flex-row items-center mb-6">
              <View className="bg-fresh p-2 rounded-lg mr-3"><Activity size={20} color="#7FB058" /></View>
              <Text className="text-mainText font-black text-xl italic">Suivi Nutritif</Text>
            </View>
            
            <MacroBar label="Protéines" current={totals.proteins} target={macroTargets.proteins} color="#A3C981" />
            <MacroBar label="Glucides" current={totals.carbs} target={macroTargets.carbs} color="#FFD97D" />
            <MacroBar label="Lipides" current={totals.fats} target={macroTargets.fats} color="#FF8080" />

            {/* SECTION DATA DESSOUS */}
            <View className="mt-2 pt-4 border-t border-gray-50 flex-row justify-around">
                <View className="items-center">
                  <Text className="text-mutedText text-[10px] font-bold uppercase tracking-tighter">Consommé</Text>
                  <Text className="text-mainText font-black text-lg">{Math.round(totals.calories)} kcal</Text>
                </View>
                <View className="items-center">
                  <Text className="text-mutedText text-[10px] font-bold uppercase tracking-tighter">Restant</Text>
                  <Text className="text-primary font-black text-lg">
                    {Math.max(0, dailyBudget - Math.round(totals.calories))} kcal
                  </Text>
                </View>
            </View>
          </View>

          <View className="bg-white p-6 rounded-[35px] mt-6 border border-secondary/10 shadow-sm">
            <View className="flex-row items-center mb-6"><BarChart3 size={20} color="#7FB058" /><Text className="text-mainText font-black text-lg ml-2 italic">Activité Hebdomadaire</Text></View>
            <View className="flex-row justify-between items-end h-24 mt-4 px-2">
              {weeklyData.map((d, i) => (
                <View key={i} className="items-center">
                  <View style={{ height: Math.max((d.kcal/dailyBudget)*60,5), width: 14, backgroundColor: d.kcal > dailyBudget ? '#FF8080' : '#A3C981' }} className="rounded-full mb-2" />
                  <Text className="text-[10px] font-bold text-mutedText uppercase">{d.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="bg-white p-6 rounded-[35px] mt-6 mb-40 border border-secondary/10 flex-row items-center shadow-sm">
            <View className="bg-primary/10 p-4 rounded-2xl mr-4"><Target size={24} color="#A3C981" /></View>
            <View className="flex-1">
              <Text className="text-mutedText text-[10px] uppercase font-bold tracking-[1px]">Votre Objectif</Text>
              <Text className="text-mainText font-black text-xl">{userData?.objectif || 'Non défini'}</Text>
            </View>
            <ChevronRight size={20} color="#A3C981" />
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      <View className="absolute bottom-10 left-4 right-4 h-20 bg-white/95 rounded-[30px] flex-row items-center justify-around px-2 shadow-2xl border border-white/50">
  {/* 1. Dashboard / Home */}
   <TouchableOpacity 
    onPress={() => navigation.navigate('Dashboard')}
    className="bg-primary/20 p-3 rounded-2xl flex-row items-center" 
  >
    <Home size={22} color="#A3C981" />
  </TouchableOpacity>

  {/* 2. Recherche Food */}
  <TouchableOpacity onPress={() => navigation.navigate('SearchFood')}>
    <Search size={22} color="#A3C981" />
  </TouchableOpacity>

  {/* 3. Scan / Ajout de plat */}
  <TouchableOpacity onPress={() => navigation.navigate('AddMeal')}>
    <ScanLine size={22} color="#A3C981" />
  </TouchableOpacity>

  {/* 4. RECOMMANDATIONS (Coach IA) - NOUVEAU */}
  <TouchableOpacity onPress={() => navigation.navigate('MealPlanner')}>
    <ChefHat size={22} color="#7FB058" />
  </TouchableOpacity>

  {/* 5. Historique */}
  <TouchableOpacity onPress={() => navigation.navigate('History')}>
    <BookOpen size={22} color="#A3C981" />
  </TouchableOpacity>

  {/* 6. Profil */}
  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
    <User size={22} color="#A3C981" />
  </TouchableOpacity>
</View>
    </View>
  );
}