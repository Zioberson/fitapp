import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from '../screens/AuthScreen';
import Dashboard from '../screens/Dashboard';
import PlanLibraryScreen from '../screens/PlanLibraryScreen';
import PlanBuilderScreen from '../screens/PlanBuilderScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import FullPlanViewScreen from '../screens/FullPlanViewScreen';

const Stack = createNativeStackNavigator();

// Navigator for the main part of the app, after user is logged in
const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }} // The dashboard will be the main hub
      />
      <Stack.Screen name="PlanLibrary" component={PlanLibraryScreen} options={{ title: 'Biblioteka Planów' }} />
      <Stack.Screen name="PlanBuilder" component={PlanBuilderScreen} options={{ title: 'Kreator Planu' }} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} options={{ title: 'Profil Podopiecznego' }} />
      <Stack.Screen name="FullPlanView" component={FullPlanViewScreen} options={{ title: 'Szczegóły Planu' }} />
      {/*
      TODO: Add screens for the training plan module here later
      */}
    </Stack.Navigator>
  );
};

// Navigator for the authentication flow
const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = ({ user }) => {
  // Based on the user's auth state, we return the appropriate navigator.
  // The user object is passed down from App.js
  return user ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;