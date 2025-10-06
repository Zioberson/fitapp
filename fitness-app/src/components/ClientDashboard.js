import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getActiveClientPlanAssignment, getPlanDetails } from '../services/firestoreService';

const ClientDashboard = ({ user }) => {
  const navigation = useNavigation();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchWorkoutPlan = async () => {
        try {
          setLoading(true);
          const planAssignment = await getActiveClientPlanAssignment(user.uid);
          if (planAssignment && planAssignment.planId) {
            const planDetails = await getPlanDetails(planAssignment.planId);
            setWorkoutPlan(planDetails);
          } else {
            setWorkoutPlan(null);
          }
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać planu treningowego.");
        } finally {
          setLoading(false);
        }
      };
      fetchWorkoutPlan();
    }, [user.uid])
  );

  const renderWorkoutPlan = () => {
    if (loading) return <ActivityIndicator size="large" color="#22C55E" />;
    if (!workoutPlan) return <Text style={styles.emptyListText}>Nie masz jeszcze przypisanego aktywnego planu.</Text>;

    const todayWorkout = workoutPlan.weeks?.[0]?.days?.[0];

    return (
      <>
        <Text style={styles.planName}>{workoutPlan.name}</Text>
        {todayWorkout?.exercises?.map((ex, index) => (
          <Text key={index} style={styles.exerciseItem}>- {ex.name} ({ex.series}x{ex.reps})</Text>
        )) || <Text>Brak ćwiczeń w planie.</Text>}
        <View style={{ marginTop: 15 }}>
          <Button title="Zobacz cały plan" onPress={() => navigation.navigate('FullPlanView', { workoutPlan })} color="#3B82F6" />
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
        <Text style={styles.subHeader}>Pomiary i Postępy</Text>
        <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
                <Button title="Dodaj Pomiar" onPress={() => navigation.navigate('AddMeasurement')} />
            </View>
            <View style={styles.buttonWrapper}>
                <Button title="Zobacz Postępy" onPress={() => navigation.navigate('ProgressHub')} color="#22C55E" />
            </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  welcome: { fontSize: 16, marginBottom: 20 },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  planName: { fontSize: 16, fontStyle: 'italic', marginBottom: 5 },
  exerciseItem: { fontSize: 14, marginLeft: 10, marginBottom: 3 },
  emptyListText: { textAlign: 'center', marginTop: 20, color: 'gray' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  }
});

export default ClientDashboard;