import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import MedicationsScreen from '../screens/MedicationsScreen/MedicationsScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import HomeStackNavigator from './HomeStackNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MedicationsStackNavigator from './MedicationsStackNavigator';
import { useDependent } from '../context/DependentContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  // Define a larger icon size
  const ICON_SIZE = 34; // Increase this value to make icons bigger (default is usually 24)
  const { isManaging } = useDependent();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0288D1',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
        },
        // Set the default icon size for all tabs
        tabBarIconStyle: {
          width: ICON_SIZE,
          height: ICON_SIZE,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator} 
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
      
          const hiddenRoutes = ['AddMedication', 'MedicationDetails', 'MedicationSchedule'];
          const shouldHideTabBar = hiddenRoutes.includes(routeName);
      
          return {
            tabBarStyle: shouldHideTabBar
              ? { display: 'none' }
              : {
                  height: 70,
                  paddingBottom: 10,
                },
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={ICON_SIZE} />
            ),
          };
        }}
      />
      {/* <Tab.Screen 
        name="Medications" 
        component={MedicationsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pill" color={color} size={ICON_SIZE} />
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Medications" 
        component={MedicationsStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'MedicationsMain';

          const hiddenRoutes = ['MedicationViewEdit'];
          const shouldHideTabBar = hiddenRoutes.includes(routeName);

          return {
            tabBarStyle: shouldHideTabBar
              ? { display: 'none' }
              : {
                  height: 70,
                  paddingBottom: 10,
                },
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="pill" color={color} size={ICON_SIZE} />
            ),
          };
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


