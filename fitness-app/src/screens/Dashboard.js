import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { getUserNotifications } from '../services/firestoreService';
import TrainerDashboard from '../components/TrainerDashboard';
import ClientDashboard from '../components/ClientDashboard';

const Dashboard = ({ user }) => {
  const navigation = useNavigation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for notification updates in real-time
    const unsubscribe = getUserNotifications(user.uid, (notifications) => {
      const anyUnread = notifications.some(n => !n.read);
      setHasUnread(anyUnread);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
          <Text style={styles.iconText}>🔔</Text>
          {hasUnread && <View style={styles.badge} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
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
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 5,
    marginLeft: 15,
  },
  iconText: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  container: {
    flex: 1,
  },
});

export default Dashboard;