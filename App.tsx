import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
// import * as Notifications from 'expo-notifications';

// Notifications.setNotificationHandler({
//   handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
//     shouldShowAlert: true,
//     shouldShowBanner: true,   // ✅ REQUIRED (iOS)
//     shouldShowList: true,     // ✅ REQUIRED (iOS)
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });


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
const Stack = createNativeStackNavigator();

// 1. Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // --- 5 SECOND LOADING TIMER ---
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    // 2. Hide the native white splash as soon as our custom view renders
    const onLayoutRootView = useCallback(async () => {
        await SplashScreen.hideAsync();
    }, []);

    // --- LOADING PAGE (Logo + Name + Spinner) ---
    if (!appIsReady) {
        return (
            <View style={styles.loadingContainer} onLayout={onLayoutRootView}>
                <StatusBar style="dark" />
                <Image
                    source={require('./assets/logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.appName}>NutriTrack</Text>

                <ActivityIndicator 
                    size="large" 
                    color="#A3C981" 
                    style={{ marginTop: 40 }} 
                />
            </View>
        );
    }

    // --- MAIN APP (Shown after 5 seconds) ---
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator 
                    initialRouteName="Welcome"
                    screenOptions={{ headerShown: false }}
                >
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
                    <Stack.Screen 
  name="MealPlanner" 
  component={MealPlannerScreen} 
  options={{ headerShown: false }} 
/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAF5', // Your custom bg-fresh color
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#A3C981', // Your custom primary green
        marginTop: 2,    // Matches the "very small space" requirement
    },
});