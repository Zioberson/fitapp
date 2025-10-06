import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TrainerDashboard from '../components/TrainerDashboard';
import ClientDashboard from '../components/ClientDashboard';

const Dashboard = ({ user }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {/* Render the correct dashboard based on user role */}
        {user.role === 'trainer' ? (
          <TrainerDashboard user={user} />
        ) : (
          <ClientDashboard user={user} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 10,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  settingsButton: {
    padding: 5,
  },
  settingsButtonText: {
    fontSize: 28,
  },
  container: {
    flex: 1,
  },
});

export default Dashboard;