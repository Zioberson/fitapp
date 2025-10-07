import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { getUserDocument } from './src/services/firestoreService';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorProvider } from './src/contexts/ErrorContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userProfile = await getUserDocument(authUser.uid);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      // Add a small delay to prevent screen flashing on startup
      setTimeout(() => setLoading(false), 500);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <ErrorProvider>
        <NavigationContainer>
            <AppNavigator user={user} />
        </NavigationContainer>
    </ErrorProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});