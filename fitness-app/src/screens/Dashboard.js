import React from 'react';
import { View, Button, StyleSheet, SafeAreaView } from 'react-native';
import TrainerDashboard from '../components/TrainerDashboard';
import ClientDashboard from '../components/ClientDashboard';

const Dashboard = ({ user, onLogout }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Render the correct dashboard based on user role */}
        {user.role === 'trainer' ? (
          <TrainerDashboard user={user} />
        ) : (
          <ClientDashboard user={user} />
        )}
      </View>
      {/* Logout button is always visible at the bottom */}
      <View style={styles.logoutContainer}>
        <Button title="Wyloguj" onPress={onLogout} color="#F59E0B" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default Dashboard;