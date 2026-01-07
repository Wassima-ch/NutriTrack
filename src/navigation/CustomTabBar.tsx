import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, Search, ScanLine, ChefHat, BookOpen, User } from 'lucide-react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

// Définition du type pour éviter l'erreur "never"
type RootStackParamList = {
  navigate: (screen: string) => void;
};

const CustomTabBar = () => {
  // On force le type ici pour que .navigate() accepte n'importe quelle string
  const navigation = useNavigation<RootStackParamList>();
  
  const state = useNavigationState(state => state);
  const currentRouteName = state ? state.routes[state.index].name : 'Dashboard';

  const NavItem = ({ icon: Icon, target }: { icon: any, target: string }) => {
    // Vérifie si la page actuelle est celle de ce bouton
    const isActive = currentRouteName === target;

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate(target)}
        // Le container s'affiche uniquement si isActive est vrai
        className={`${
          isActive 
            ? 'bg-primary/20 p-3 rounded-2xl' 
            : 'p-3'
        } items-center justify-center`}
      >
        <Icon 
          size={22} 
          color={isActive ? "#A3C981" : "#D0DDC4"} 
          strokeWidth={isActive ? 2.5 : 2}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="absolute bottom-10 left-4 right-4 h-20 bg-white/95 rounded-[30px] flex-row items-center justify-around px-2 shadow-2xl shadow-black/10 border border-white/50">
      <NavItem icon={Home} target="Dashboard" />
      <NavItem icon={Search} target="SearchFood" />
      <NavItem icon={ScanLine} target="AddMeal" />
      <NavItem icon={ChefHat} target="MealPlanner" />
      <NavItem icon={BookOpen} target="History" />
      <NavItem icon={User} target="Profile" />
    </View>
  );
};

export default CustomTabBar;