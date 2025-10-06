import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Clipboard } from 'react-native';
import { getTrainerClients } from '../services/firestoreService';

const TrainerDashboard = ({ user }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const clientList = await getTrainerClients(user.uid);
        setClients(clientList);
      } catch (error) {
        Alert.alert("Błąd", "Nie udało się pobrać listy podopiecznych.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user.uid]);

  const copyToClipboard = () => {
    Clipboard.setString(user.accessCode);
    Alert.alert("Skopiowano!", "Twój kod dostępu został skopiowany do schowka.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panel Trenera</Text>
      <Text style={styles.welcome}>Witaj, {user.email}!</Text>

      <View style={styles.accessCodeContainer}>
        <Text style={styles.accessCodeLabel}>Twój kod dostępu dla podopiecznych:</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <Text style={styles.accessCode}>{user.accessCode}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Twoi Podopieczni:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text style={styles.clientItem}>{item.email}</Text>}
          ListEmptyComponent={<Text style={styles.emptyListText}>Nie masz jeszcze żadnych podopiecznych.</Text>}
        />
      )}

      <Button title="Stwórz nowy plan treningowy" onPress={() => alert('Funkcjonalność w budowie!')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 16,
    marginBottom: 15,
  },
  accessCodeContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  accessCodeLabel: {
    fontSize: 14,
    color: '#666',
  },
  accessCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginTop: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  clientItem: {
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default TrainerDashboard;