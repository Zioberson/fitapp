import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getActiveClientPlanAssignment, getPlanDetails, getMealPlanDetails } from '../services/firestoreService';

const ClientDashboard = ({ user }) => {
  const navigation = useNavigation();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchActivePlans = async () => {
        try {
          setLoading(true);
          // Fetch workout plan
          const workoutAssignment = await getActiveClientPlanAssignment(user.uid, 'workout');
          if (workoutAssignment) {
            const details = await getPlanDetails(workoutAssignment.planId);
            setWorkoutPlan(details);
          } else {
            setWorkoutPlan(null);
          }

          // Fetch meal plan
          const mealAssignment = await getActiveClientPlanAssignment(user.uid, 'nutrition');
          if (mealAssignment) {
            const details = await getMealPlanDetails(mealAssignment.planId);
            setMealPlan(details);
          } else {
            setMealPlan(null);
          }
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać aktywnych planów.");
        } finally {
          setLoading(false);
        }
      };
      fetchActivePlans();
    }, [user.uid])
  );

  const renderWorkoutPlan = () => {
    if (!workoutPlan) return <Text style={styles.emptyListText}>Brak aktywnego planu treningowego.</Text>;
    const todayWorkout = workoutPlan.weeks?.[0]?.days?.[0];
    return (
      <>
        <Text style={styles.planName}>{workoutPlan.name}</Text>
        {todayWorkout?.exercises?.map((ex, i) => <Text key={i} style={styles.exerciseItem}>- {ex.name} ({ex.series}x{ex.reps})</Text>) || <Text>Brak ćwiczeń.</Text>}
        <View style={styles.buttonWrapper}><Button title="Zobacz cały plan" onPress={() => navigation.navigate('FullPlanView', { workoutPlan })} color="#3B82F6" /></View>
      </>
    );
  };

  const renderMealPlan = () => {
      if (!mealPlan) return <Text style={styles.emptyListText}>Brak aktywnego planu żywieniowego.</Text>;
      return (
        <>
            <Text style={styles.planName}>{mealPlan.name}</Text>
            <View style={styles.nutritionSummary}>
                <Text>Kcal: {mealPlan.totalNutrition.calories.toFixed(0)}</Text>
                <Text>B: {mealPlan.totalNutrition.protein.toFixed(0)}g</Text>
                <Text>T: {mealPlan.totalNutrition.fat.toFixed(0)}g</Text>
                <Text>W: {mealPlan.totalNutrition.carbs.toFixed(0)}g</Text>
            </View>
            <View style={styles.buttonWrapper}><Button title="Zobacz całą dietę" onPress={() => navigation.navigate('ClientMealPlanView', { mealPlanId: mealPlan.id })} color="#3B82F6" /></View>
        </>
      );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel Podopiecznego</Text>
      <Text style={styles.welcome}>Witaj, {user.email}!</Text>

      {loading ? <ActivityIndicator size="large" color="#22C55E" /> : (
        <>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Twój dzisiejszy trening:</Text>
                {renderWorkoutPlan()}
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Twój dzisiejszy plan żywieniowy:</Text>
                {renderMealPlan()}
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Pomiary i Postępy</Text>
                <View style={styles.buttonRow}>
                    <Button title="Dodaj Pomiar" onPress={() => navigation.navigate('AddMeasurement')} />
                    <Button title="Zobacz Postępy" onPress={() => navigation.navigate('ProgressHub')} color="#22C55E" />
                </View>
            </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 10 },
  welcome: { fontSize: 16, marginBottom: 20, paddingHorizontal: 10 },
  section: { marginBottom: 15, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  planName: { fontSize: 16, fontStyle: 'italic', marginBottom: 5 },
  exerciseItem: { fontSize: 14, marginLeft: 10, marginBottom: 3 },
  emptyListText: { textAlign: 'center', paddingVertical: 20, color: 'gray' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly' },
  buttonWrapper: { marginTop: 15 },
  nutritionSummary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#e6fffa', padding: 10, borderRadius: 5, marginVertical: 10 },
});

export default ClientDashboard;