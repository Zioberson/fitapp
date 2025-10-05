import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthScreen from './src/screens/AuthScreen';
import Dashboard from './src/screens/Dashboard'; // Will be created next
import { auth } from './src/firebaseConfig'; // Keep for future use

export default function App() {
  const [user, setUser] = useState(null); // null -> not authenticated

  // This function will be called by AuthScreen on successful login/register
  const handleAuthentication = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <View style={styles.container}>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuth={handleAuthentication} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});