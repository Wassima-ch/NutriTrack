import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Import Firebase pour la vérification au démarrage
import { auth, db } from './src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Import des services de notification
import { 
    requestNotificationPermissions, 
    scheduleMealReminders 
} from './src/services/NotificationService';

// Screen Imports
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupBasicScreen from './src/screens/SignupBasicScreen';
import SignupMetricsScreen from './src/screens/SignupMetricsScreen';
import SignupActivityScreen from './src/screens/SignupActivityScreen';
import SignupGoalScreen from './src/screens/SignupGoalScreen';
import SignupPrefsScreen from './src/screens/SignupPrefsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddMealScreen from './src/screens/AddMealScreen'; 
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MealPlannerScreen from './src/screens/MealPlannerScreen';

// Masque les alertes sur l'écran (elles restent dans le terminal)
LogBox.ignoreAllLogs();
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // 1. Demande de permissions au lancement
                const hasPermission = await requestNotificationPermissions();
                
                // 2. Si l'utilisateur est connecté, on synchronise les notifications
                // comme le fait WhatsApp au démarrage
                auth.onAuthStateChanged(async (user) => {
                    if (user && hasPermission) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists() && userDoc.data().notifications !== false) {
                            await scheduleMealReminders();
                            console.log("🚀 Rappels synchronisés au démarrage");
                        }
                    }
                });

                // Timer de 3 secondes (réduit pour une meilleure expérience)
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar style="dark" />
                <Image source={require('./assets/logo.png')} style={styles.logo} />
                <Text style={styles.appName}>NutriTrack</Text>
                <ActivityIndicator size="large" color="#A3C981" style={{ marginTop: 40 }} />
            </View>
        );
    }

    return (
        <SafeAreaProvider onLayout={onLayoutRootView}>
            <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignupBasic" component={SignupBasicScreen} />
                    <Stack.Screen name="SignupMetrics" component={SignupMetricsScreen} />
                    <Stack.Screen name="SignupActivity" component={SignupActivityScreen} />
                    <Stack.Screen name="SignupGoal" component={SignupGoalScreen} />
                    <Stack.Screen name="SignupPrefs" component={SignupPrefsScreen} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="AddMeal" component={AddMealScreen} />  
                    <Stack.Screen name="SearchFood" component={SearchScreen} />
                    <Stack.Screen name="History" component={HistoryScreen} />
                    <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, backgroundColor: '#F8FAF5', alignItems: 'center', justifyContent: 'center' },
    logo: { width: 150, height: 150, resizeMode: 'contain' },
    appName: { fontSize: 42, fontWeight: 'bold', color: '#A3C981', marginTop: 2 },
});