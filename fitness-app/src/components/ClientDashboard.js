import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView } from 'react-native';

// Mock data
const mockWorkoutPlan = {
  name: 'Trening FBW A',
  date: '2025-10-05',
  exercises: [
    { id: '1', name: 'Przysiady ze sztangą', sets: '3', reps: '10' },
    { id: '2', name: 'Wyciskanie na ławce', sets: '3', reps: '8' },
    { id: '3', name: 'Wiosłowanie sztangą', sets: '3', reps: '8' },
  ],
};

const ClientDashboard = ({ user }) => {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [biceps, setBiceps] = useState('');

  const handleSaveMeasurements = () => {
    alert(`Zapisano pomiary:\nWaga: ${weight} kg\nTalia: ${waist} cm\nBiceps: ${biceps} cm`);
    // Clear fields
    setWeight('');
    setWaist('');
    setBiceps('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel Podopiecznego</Text>
      <Text style={styles.welcome}>Witaj, {user.email}!</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Twój dzisiejszy trening:</Text>
        <Text style={styles.planName}>{mockWorkoutPlan.name}</Text>
        {mockWorkoutPlan.exercises.map(ex => (
          <Text key={ex.id} style={styles.exerciseItem}>
            - {ex.name} ({ex.sets} serie po {ex.reps} powtórzeń)
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Dodaj swoje pomiary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Waga (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Talia (cm)"
          keyboardType="numeric"
          value={waist}
          onChangeText={setWaist}
        />
        <TextInput
          style={styles.input}
          placeholder="Biceps (cm)"
          keyboardType="numeric"
          value={biceps}
          onChangeText={setBiceps}
        />
        <Button title="Zapisz pomiary" onPress={handleSaveMeasurements} />
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 25,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  exerciseItem: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default ClientDashboard;