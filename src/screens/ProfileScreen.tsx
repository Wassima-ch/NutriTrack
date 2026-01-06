import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, TextInput, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications'; // Pour l'annulation
import {
  scheduleMealReminders, 
  requestNotificationPermissions 
} from '../services/NotificationService';
import { 
  ArrowLeft, LogOut, Bell, UserCircle2, Info,
  Scale, Target as TargetIcon, Ruler, CalendarDays, User, Activity, Edit3, Check, Camera, Plus, X, FlaskConical
} from 'lucide-react-native';

const ProfileItem = ({ icon: Icon, label, value, field, isEditing, data, setData, keyboardType = 'default' }: any) => (
  <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 border border-secondary/20 shadow-sm">
    <View className="bg-fresh p-2 rounded-xl mr-4">
      <Icon size={20} color="#A3C981" />
    </View>
    <View className="flex-1">
      <Text className="text-mutedText text-[10px] font-bold uppercase tracking-widest">{label}</Text>
      {isEditing ? (
        <TextInput
          className="text-mainText font-bold text-base p-0"
          value={String(data?.[field] || '')}
          keyboardType={keyboardType}
          onChangeText={(txt) => setData({ ...data, [field]: txt })}
          autoCorrect={false}
        />
      ) : (
        <Text className="text-mainText font-bold text-base">{value || '--'}</Text>
      )}
    </View>
  </View>
);

export default function ProfileScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPref, setNewPref] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userSession = auth.currentUser;
      if (!userSession) return;
      const userDoc = await getDoc(doc(db, "users", userSession.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setData({
          ...userData,
          preferences: userData.preferences || [],
          objectif: userData.objectif || userData.goal || '',
          prenom: userData.prenom || '',
          nom: userData.nom || '',
          profileImage: userData.profileImage || null
        });
        setNotificationsEnabled(userData.notifications ?? true);
      }
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gère l'activation réelle des rappels ou leur suppression
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
        if (value) {
            const hasPermission = await requestNotificationPermissions();
            if (hasPermission) {
                await scheduleMealReminders();
                Alert.alert("Activé", "Rappels programmés (8h30, 12h30, 19h30)");
            }
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
        
        if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { notifications: value });
        }
    } catch (err) {
        console.error(err);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Erreur", "Accès refusé");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setData({ ...data, profileImage: result.assets[0].uri });
  };

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { ...data, notifications: notificationsEnabled });
        setIsEditing(false);
        Alert.alert("Succès", "Profil mis à jour !");
      }
    } catch (e) { Alert.alert("Erreur", "Échec sauvegarde."); }
  };

  const handleAddPreference = () => {
    if (newPref.trim().length > 0) {
      const currentPrefs = data.preferences || [];
      if (!currentPrefs.includes(newPref.trim())) setData({ ...data, preferences: [...currentPrefs, newPref.trim()] });
      setNewPref(''); setModalVisible(false);
    }
  };

  if (loading) return <View className="flex-1 bg-fresh justify-center items-center"><ActivityIndicator size="large" color="#7FB058" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-fresh">
      <View className="flex-row items-center justify-between px-6 py-2">
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={28} color="#A3C981" /></TouchableOpacity>
        <Text className="text-xl font-black text-mainText">Mon Profil</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)} className={`p-2 rounded-xl ${isEditing ? 'bg-primary' : 'bg-white border border-secondary/20'}`}>
          {isEditing ? <Check size={22} color="white" /> : <Edit3 size={22} color="#A3C981" />}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="items-center my-6">
          <TouchableOpacity onPress={pickImage} className="relative shadow-lg">
            <View className="bg-white p-1 rounded-full border-4 border-primary/10">
              {data?.profileImage ? <Image source={{ uri: data.profileImage }} className="w-24 h-24 rounded-full" /> : <View className="w-24 h-24 rounded-full bg-fresh items-center justify-center"><UserCircle2 size={70} color="#7FB058" strokeWidth={1} /></View>}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white"><Camera size={14} color="white" /></View>
          </TouchableOpacity>
          {isEditing ? (
            <View className="flex-row mt-4 space-x-2">
              <TextInput className="text-xl font-black text-mainText border-b-2 border-primary/30 min-w-[80px] text-center" value={data?.prenom} onChangeText={(t) => setData({...data, prenom: t})} />
              <TextInput className="text-xl font-black text-mainText border-b-2 border-primary/30 min-w-[80px] text-center" value={data?.nom} onChangeText={(t) => setData({...data, nom: t})} />
            </View>
          ) : <Text className="text-2xl font-black text-mainText mt-4 uppercase tracking-tighter">{data?.prenom} {data?.nom}</Text>}
          <Text className="text-mutedText font-medium mt-1">{auth.currentUser?.email}</Text>
        </View>

        <Text className="text-mainText font-black text-lg mb-3 italic">Mes Métriques</Text>
        <View className="flex-row justify-between">
            <View style={{width: '48%'}}><ProfileItem icon={CalendarDays} label="Âge" value={data?.age} field="age" keyboardType="numeric" isEditing={isEditing} data={data} setData={setData} /></View>
            <View style={{width: '48%'}}><ProfileItem icon={User} label="Genre" value={data?.sexe || data?.genre} field="sexe" isEditing={isEditing} data={data} setData={setData} /></View>
        </View>
        <ProfileItem icon={Ruler} label="Taille (cm)" value={data?.taille} field="taille" keyboardType="numeric" isEditing={isEditing} data={data} setData={setData} />
        <ProfileItem icon={Scale} label="Poids (kg)" value={data?.poids} field="poids" keyboardType="numeric" isEditing={isEditing} data={data} setData={setData} />
        <ProfileItem icon={Activity} label="Activité" value={data?.niveauActivite} field="niveauActivite" isEditing={isEditing} data={data} setData={setData} />
        <ProfileItem icon={TargetIcon} label="Objectif" value={data?.objectif} field="objectif" isEditing={isEditing} data={data} setData={setData} />

        <Text className="text-mainText font-black text-lg mt-4 mb-3 italic">Paramètres</Text>
        
        {/* Section Notifications avec Bouton Test */}
        <View className="bg-white p-4 rounded-3xl mb-3 border border-secondary/20 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-fresh p-2 rounded-xl mr-4"><Bell size={20} color="#A3C981" /></View>
              <Text className="text-mainText font-bold">Notifications</Text>
            </View>
            <Switch 
              trackColor={{ false: "#CBD5E1", true: "#A3C981" }} 
              thumbColor="white" 
              onValueChange={toggleNotifications} 
              value={notificationsEnabled} 
            />
          </View>
          
        </View>

        <View className="bg-white p-4 rounded-2xl mb-8 flex-row items-center border border-secondary/20 shadow-sm">
            <View className="bg-fresh p-2 rounded-xl mr-4"><Info size={20} color="#A3C981" /></View>
            <View><Text className="text-mutedText text-[10px] font-bold uppercase tracking-widest">Version</Text><Text className="text-mainText font-bold">1.0.8 - Stable</Text></View>
        </View>

        <TouchableOpacity onPress={() => signOut(auth).then(()=>navigation.replace('Login'))} className="flex-row items-center justify-center bg-red-50 p-5 rounded-[25px] mb-12 border border-red-100">
          <LogOut size={20} color="#FF8080" /><Text className="text-[#FF8080] font-bold text-lg ml-2 uppercase tracking-tighter">Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="w-full">
            <View className="bg-white p-6 rounded-[30px] shadow-2xl">
              <Text className="text-xl font-black text-mainText mb-4">Ajouter une préférence</Text>
              <TextInput placeholder="Ex: Sans Lactose..." className="bg-fresh p-4 rounded-2xl mb-6 font-bold" value={newPref} onChangeText={setNewPref} autoFocus={true} />
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 p-4 rounded-2xl bg-gray-100"><Text className="text-center font-bold text-mutedText">Annuler</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleAddPreference} className="flex-1 p-4 rounded-2xl bg-primary"><Text className="text-center font-bold text-white">Ajouter</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}