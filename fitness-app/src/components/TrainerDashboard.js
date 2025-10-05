import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';

// Mock data - in a real app, this would come from Firestore
const mockClients = [
  { id: '1', name: 'Jan Kowalski' },
  { id: '2', name: 'Anna Nowak' },
  { id: '3', name: 'Piotr Wiśniewski' },
];

const TrainerDashboard = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panel Trenera</Text>
      <Text style={styles.welcome}>Witaj, {user.email}!</Text>

      <Text style={styles.subHeader}>Twoi Podopieczni:</Text>
      <FlatList
        data={mockClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.clientItem}>{item.name}</Text>}
      />

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
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  clientItem: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default TrainerDashboard;