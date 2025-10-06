import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getActiveClientPlanAssignment, getPlanDetails, addMeasurement } from '../services/firestoreService';

const ClientDashboard = ({ user }) => {
  const navigation = useNavigation();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [biceps, setBiceps] = useState('');

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        setLoading(true);
        const planAssignment = await getActiveClientPlanAssignment(user.uid);
        if (planAssignment && planAssignment.planId) {
          const planDetails = await getPlanDetails(planAssignment.planId);
          setWorkoutPlan(planDetails);
        }
      } catch (error) {
        Alert.alert("Błąd", "Nie udało się pobrać planu treningowego.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, [user.uid]);

  const handleSaveMeasurements = async () => {
    if (!weight && !waist && !biceps) {
        Alert.alert("Błąd", "Wprowadź co najmniej jeden pomiar.");
        return;
    }
    try {
        const measurementData = {
            weight: parseFloat(weight) || null,
            waist: parseFloat(waist) || null,
            biceps: parseFloat(biceps) || null,
        };
        await addMeasurement(user.uid, measurementData);
        Alert.alert("Sukces!", "Twoje pomiary zostały zapisane.");
        // Clear fields
        setWeight('');
        setWaist('');
        setBiceps('');
    } catch (error) {
        Alert.alert("Błąd", "Nie udało się zapisać pomiarów.");
        console.error(error);
    }
  };

  const renderWorkoutPlan = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#22C55E" />;
    }
    if (!workoutPlan) {
      return <Text style={styles.emptyListText}>Nie masz jeszcze przypisanego aktywnego planu.</Text>;
    }
    // TODO: Implement a more robust logic to determine the current training day
    // based on the plan's start date and the current date.
    // For now, this is a simplified display showing the first day of the plan.
    const todayWorkout = workoutPlan.weeks?.[0]?.days?.[0];

    return (
      <>
        <Text style={styles.planName}>{workoutPlan.name}</Text>
        {todayWorkout?.exercises?.map((ex, index) => (
          <Text key={index} style={styles.exerciseItem}>
            - {ex.name} ({ex.series} serie po {ex.reps} powtórzeń)
          </Text>
        )) || <Text>Brak ćwiczeń w planie.</Text>}

        <View style={{ marginTop: 15 }}>
            <Button
                title="Zobacz cały plan"
                onPress={() => navigation.navigate('FullPlanView', { workoutPlan })}
                color="#3B82F6"
            />
        </View>
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel Podopiecznego</Text>
      <Text style={styles.welcome}>Witaj, {user.email}!</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Twój dzisiejszy trening:</Text>
        {renderWorkoutPlan()}
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default ClientDashboard;