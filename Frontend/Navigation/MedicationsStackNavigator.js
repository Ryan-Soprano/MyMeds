import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MedicationsScreen from '../screens/MedicationsScreen/MedicationsScreen';
import MedicationViewEditScreen from '../screens/ViewEditMedScreen';



const Stack = createStackNavigator();

export default function MedicationsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicationsMain" component={MedicationsScreen} />
      <Stack.Screen name="MedicationViewEdit" component={MedicationViewEditScreen} />
    </Stack.Navigator>
  );
}