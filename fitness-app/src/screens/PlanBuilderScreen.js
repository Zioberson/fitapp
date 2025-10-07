import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createWorkoutPlan } from '../services/firestoreService';
import { auth } from '../firebaseConfig';

const PlanBuilderScreen = () => {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([{ name: '', series: '', reps: '', rest: '', videoUrl: '' }]);
  const [loading, setLoading] = useState(false);

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', series: '', reps: '', rest: '', videoUrl: '' }]);
  };

  const removeExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSavePlan = async () => {
    if (!planName) {
      Alert.alert("Błąd", "Nazwa planu jest wymagana.");
      return;
    }
    if (exercises.some(e => !e.name || !e.series || !e.reps)) {
        Alert.alert("Błąd", "Uzupełnij nazwę, serie i powtórzenia dla wszystkich ćwiczeń.");
        return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Użytkownik nie jest zalogowany.");
      }

      const planData = {
        trainerId: currentUser.uid,
        name: planName,
        description: description,
        // For simplicity, we'll structure it as one week with one day for now.
        // This can be expanded later.
        weeks: [
          {
            weekNumber: 1,
            days: [{ dayNumber: 1, name: "Dzień Treningowy 1", exercises: exercises }]
          }
        ]
      };

      await createWorkoutPlan(planData);
      Alert.alert("Sukces!", "Plan treningowy został zapisany.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać planu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Kreator Planu Treningowego</Text>

      <TextInput
        style={styles.input}
        placeholder="Nazwa planu (np. FBW A, Push Day)"
        value={planName}
        onChangeText={setPlanName}
      />
      <TextInput
        style={styles.input}
        placeholder="Krótki opis planu (opcjonalnie)"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.subHeader}>Ćwiczenia</Text>
      {exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseContainer}>
          <TextInput style={styles.input} placeholder="Nazwa ćwiczenia" value={exercise.name} onChangeText={(val) => handleExerciseChange(index, 'name', val)} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.rowInput]} placeholder="Serie" value={exercise.series} onChangeText={(val) => handleExerciseChange(index, 'series', val)} keyboardType="numeric" />
            <TextInput style={[styles.input, styles.rowInput]} placeholder="Powtórzenia" value={exercise.reps} onChangeText={(val) => handleExerciseChange(index, 'reps', val)} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.rowInput]} placeholder="Przerwa (s)" value={exercise.rest} onChangeText={(val) => handleExerciseChange(index, 'rest', val)} keyboardType="numeric" />
            <TextInput style={[styles.input, styles.rowInput]} placeholder="Link do wideo" value={exercise.videoUrl} onChangeText={(val) => handleExerciseChange(index, 'videoUrl', val)} />
          </View>
          <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Usuń ćwiczenie</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addExercise} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Dodaj kolejne ćwiczenie</Text>
      </TouchableOpacity>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity onPress={handleSavePlan} disabled={loading} style={styles.saveButton}>
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.saveButtonText}>Zapisz Plan</Text>
            )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  exerciseContainer: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowInput: { flex: 1, marginHorizontal: 2 },
  removeButton: { marginTop: 10, padding: 5, backgroundColor: '#ff4d4d', borderRadius: 5, alignItems: 'center' },
  removeButtonText: { color: 'white', fontWeight: 'bold' },
  addButton: { padding: 15, backgroundColor: '#e0e0e0', borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  addButtonText: { fontSize: 16, fontWeight: 'bold' },
  saveButtonContainer: { marginTop: 20, marginBottom: 40 },
  saveButton: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  }
});

export default PlanBuilderScreen;