import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import MedicationDetailsScreen from '../screens/AddMedScreens/MedDetails';
import MedicationScheduleScreen from '../screens/AddMedScreens/MedSchedule';


const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} />
      <Stack.Screen name="MedicationSchedule" component={MedicationScheduleScreen} />
    </Stack.Navigator>
  );
}
