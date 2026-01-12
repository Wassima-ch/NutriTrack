import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { doc, collection, query, where, onSnapshot, orderBy, limit, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Flame, Home, BookOpen, Activity, BarChart3, 
         Search, ChevronRight, Calendar, Clock, Target, User, 
         ChefHat, Droplets, Plus, Utensils 
} from 'lucide-react-native';
import { calculateBMR, calculateMacros } from '../utils/nutrition';
import Recommendation from '../components/Recommendation'; 
import { BadgeSystem } from '../components/BadgeSystem';
import { requestNotificationPermissions, 
         scheduleMealReminders, 
         scheduleWaterReminders,
         sendKcalAlert 
} from '../services/NotificationService';

type WeeklyEntry = {
  day: string;
  kcal: number;
  dateKey: string;
};
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
  const [weeklyData, setWeeklyData] = useState<WeeklyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [stats, setStats] = useState({ total: 0, streak: 0 });
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const todayMaroc = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });
  const dailyBudget = useMemo(() => calculateBMR(userData), [userData]);
  const macroTargets = useMemo(() => calculateMacros(dailyBudget), [dailyBudget]);
  useEffect(() => {
    if (!loading && dailyBudget > 0) {
      if (totals.calories > dailyBudget && !alertSent) {
        sendKcalAlert(totals.calories, dailyBudget);
        setAlertSent(true);
      } else if (totals.calories <= dailyBudget && alertSent) {
        setAlertSent(false);
      }
    }
  }, [totals.calories, dailyBudget, alertSent, loading]);
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const perm = await requestNotificationPermissions();
        if (perm) await scheduleMealReminders();
      } catch (err) {
        console.error("Notification Init Error:", err);
      }
    };
    initNotifications();
  }, []);
  useEffect(() => {
    if (!loading) scheduleWaterReminders(waterGlasses);
  }, [waterGlasses, loading]);
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { 
        timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit' 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    const userUid = auth.currentUser?.uid;
    if (!userUid) return;
    const unsubUser = onSnapshot(doc(db, "users", userUid), (snap) => setUserData(snap.data()));
    const waterDocRef = doc(db, "waterTracking", `${userUid}_${todayMaroc}`);
    const unsubWater = onSnapshot(waterDocRef, (snap) => {
      setWaterGlasses(snap.exists() ? snap.data().count : 0);
    });
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
    const qWeek = query(collection(db, "meals"), where("userId", "==", userUid), orderBy("createdAt", "desc"), limit(100));
    const unsubWeek = onSnapshot(qWeek, (snap) => {
      const daysMap: Record<string, number> = {};
      snap.forEach(d => { 
        const m = d.data(); 
        daysMap[m.date] = (daysMap[m.date] || 0) + (Number(m.calories) || 0); 
      });
      let currentStreak = 0;
      let checkDate = new Date();
      while (daysMap[checkDate.toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' })]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      setStats({ total: snap.size, streak: currentStreak });
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); 
        d.setDate(d.getDate() - i);
        const k = d.toLocaleDateString('fr-FR', { timeZone: 'Africa/Casablanca' });
        return { 
          day: d.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Africa/Casablanca' }), 
          kcal: daysMap[k] || 0,
          dateKey: k
        };
      }).reverse();
      setWeeklyData(last7);
      setLoading(false);
    });
    return () => { 
      clearInterval(timer); 
      unsubUser(); unsubWater(); unsubToday(); unsubWeek(); 
    };
  }, [todayMaroc]);
  const handleAddWater = async () => {
    const userUid = auth.currentUser?.uid;
    const waterDocRef = doc(db, "waterTracking", `${userUid}_${todayMaroc}`);
    try {
      if (waterGlasses === 0) {
        await setDoc(waterDocRef, { count: 1, userId: userUid, date: todayMaroc });
      } else {
        await updateDoc(waterDocRef, { count: increment(1) });
      }
    } catch (e) { 
      console.error("Firestore Water Add Error:", e); 
    }
  };
  const handleRemoveWater = async () => {
    if (waterGlasses <= 0) return;
    const userUid = auth.currentUser?.uid;
    const waterDocRef = doc(db, "waterTracking", `${userUid}_${todayMaroc}`);
    try {
      await updateDoc(waterDocRef, { count: increment(-1) });
    } catch (e) { 
      console.error("Firestore Water Remove Error:", e); 
    }
  };
  const getHydrationStatus = () => {
    if (waterGlasses === 0) return "COMMENCEZ !";
    if (waterGlasses >= 8) return "EXCELLENT !";
    return "CONTINUEZ !";
  };
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
          <Recommendation caloriesToday={totals.calories} bmr={dailyBudget} />
          <BadgeSystem 
            totalMeals={stats.total} 
            streak={stats.streak} 
            goalReachedToday={totals.calories >= dailyBudget * 0.85 && totals.calories <= dailyBudget * 1.15} 
            perfectWeek={false} 
          />
          <View className="bg-white p-6 rounded-[35px] mt-6 border border-secondary/10 shadow-sm">
            <View className="flex-row items-center mb-6">
              <View className="bg-fresh p-2 rounded-lg mr-3"><Activity size={20} color="#7FB058" /></View>
              <Text className="text-mainText font-black text-xl italic">Suivi Nutritif</Text>
            </View>
            <MacroBar label="Protéines" current={totals.proteins} target={macroTargets.proteins} color="#A3C981" />
            <MacroBar label="Glucides" current={totals.carbs} target={macroTargets.carbs} color="#FFD97D" />
            <MacroBar label="Lipides" current={totals.fats} target={macroTargets.fats} color="#FF8080" />
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
            <View className="flex-row items-center mb-6"> 
              <View className="bg-fresh p-2 rounded-lg mr-3"><BarChart3 size={20} color="#7FB058" /></View>
              <Text className="text-mainText font-black text-lg italic">Activité Hebdomadaire</Text>
            </View>
            <View className="flex-row justify-between items-end h-24 mt-4 px-2">
              {weeklyData.map((d) => (
                <View key={d.dateKey} className="items-center">
                  <View 
                    style={{ 
                        height: Math.max((d.kcal/dailyBudget)*60, 5), 
                        width: 14, 
                        backgroundColor: d.kcal > dailyBudget ? '#FF8080' : '#A3C981' 
                    }} 
                    className="rounded-full mb-2" 
                  />
                  <Text className="text-[10px] font-bold text-mutedText uppercase">{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="bg-white p-6 rounded-[40px] mt-6 border border-blue-50 shadow-2xl shadow-blue-100/50 overflow-hidden relative">
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-50/30 rounded-full" />           
            <View className="flex-row justify-between items-center mb-8 z-10">
              <View>
                <Text className="text-mainText font-black text-xl italic mr-2">Suivi d’hydratation</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`w-2 h-2 rounded-full mr-2 ${waterGlasses >= 8 ? 'bg-primary' : 'bg-bluePrimary'}`} />
                  <Text className="text-mutedText text-[10px] font-bold uppercase tracking-widest">
                    {waterGlasses >= 8 ? "Objectif atteint !" : `${8 - waterGlasses} verres restants`}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
                <TouchableOpacity
                  onPress={handleRemoveWater}
                  disabled={waterGlasses <= 0}
                  className={`w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm ${waterGlasses <= 0 ? 'opacity-40' : ''}`}
                >
                  <Text className="text-bluePrimary font-black text-xl">-</Text>
                </TouchableOpacity>
                <View className="w-3" />
                <TouchableOpacity 
                  onPress={handleAddWater}
                  className="w-10 h-10 items-center justify-center bg-bluePrimary rounded-xl shadow-lg shadow-blue-300 active:scale-95"
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>         
            <View className="flex-row justify-between items-end mb-8 px-1 z-10">
              {Array.from({ length: 8 }, (_, i) => (
                <View key={`glass-${i}`} style={{ width: '10.5%' }} className="items-center">
                   <Image 
                      source={require('../../assets/verre.png')} 
                      style={{ 
                        width: '100%', 
                        height: 48, 
                        opacity: i < waterGlasses ? 1 : 0.15 
                      }}
                      resizeMode="contain"
                    />
                  <View className={`mt-3 h-1 rounded-full w-full ${i < waterGlasses ? 'bg-bluePrimary' : 'bg-gray-100'}`} />
                </View>
              ))}
            </View>
            <View className={`overflow-hidden rounded-3xl p-4 flex-row items-center justify-between ${waterGlasses >= 8 ? 'bg-primary' : 'bg-bluePrimary'}`}>
              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-xl border border-white/30">
                  <Droplets size={18} color="white" fill="white" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-black text-lg leading-tight">{Math.round((waterGlasses / 8) * 100)}%</Text>
                  <Text className="text-white/70 text-[8px] font-bold uppercase tracking-widest">Hydratation</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white font-black italic text-[11px] mb-1">
                  {getHydrationStatus()}
                </Text>
                <View className="bg-black/10 px-3 py-1 rounded-lg">
                  <Text className="text-white font-bold text-[9px]">{waterGlasses * 250} ml</Text>
                </View>
              </View>
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
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} className="bg-primary/20 p-3 rounded-2xl flex-row items-center">
          <Home size={22} color="#A3C981" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SearchFood')}><Search size={22} color="#A3C981" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddMeal')}><Utensils size={22} color="#A3C981" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MealPlanner')}><ChefHat size={22} color="#7FB058" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('History')}><BookOpen size={22} color="#A3C981" /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}><User size={22} color="#A3C981" /></TouchableOpacity>
      </View>
    </View>
  );
}