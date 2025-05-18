import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // Changed from native-stack
import { DependentProvider } from './context/DependentContext';
import AuthNavigator from './Navigation/AuthNavigator';
import TabNavigator from './Navigation/TabNavigator';

const Stack = createStackNavigator(); // Changed from createNativeStackNavigator

export default function App() {
  return (
    <DependentProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="MainApp" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </DependentProvider>
  );
}