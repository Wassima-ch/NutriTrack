import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, Search, Utensils, ChefHat, BookOpen, User } from 'lucide-react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

type RootStackParamList = {
  navigate: (screen: string) => void;
};
interface NavItemProps {
  icon: any;
  target: string;
  isActive: boolean;
  onPress: () => void;
}
const NavItem = ({ icon: Icon, target, isActive, onPress }: NavItemProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
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
const CustomTabBar = () => {
  const navigation = useNavigation<RootStackParamList>();
  const state = useNavigationState(state => state);
  const currentRouteName = state ? state.routes[state.index].name : 'Dashboard';
  const handlePress = (target: string) => {
    navigation.navigate(target);
  };
  return (
    <View className="absolute bottom-10 left-4 right-4 h-20 bg-white/95 rounded-[30px] flex-row items-center justify-around px-2 shadow-2xl shadow-black/10 border border-white/50">
      <NavItem 
        icon={Home} 
        target="Dashboard" 
        isActive={currentRouteName === "Dashboard"} 
        onPress={() => handlePress("Dashboard")} 
      />
      <NavItem 
        icon={Search} 
        target="SearchFood" 
        isActive={currentRouteName === "SearchFood"} 
        onPress={() => handlePress("SearchFood")} 
      />
      <NavItem 
        icon={Utensils} 
        target="AddMeal" 
        isActive={currentRouteName === "AddMeal"} 
        onPress={() => handlePress("AddMeal")} 
      />
      <NavItem 
        icon={ChefHat} 
        target="MealPlanner" 
        isActive={currentRouteName === "MealPlanner"} 
        onPress={() => handlePress("MealPlanner")} 
      />
      <NavItem 
        icon={BookOpen} 
        target="History" 
        isActive={currentRouteName === "History"} 
        onPress={() => handlePress("History")} 
      />
      <NavItem 
        icon={User} 
        target="Profile" 
        isActive={currentRouteName === "Profile"} 
        onPress={() => handlePress("Profile")} 
      />
    </View>
  );
};
export default CustomTabBar;