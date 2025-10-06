import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getActiveClientPlanAssignment, getPlanDetails, getMealPlanDetails } from '../services/firestoreService';

const ClientProfileScreen = ({ route }) => {
  const { client } = route.params;
  const navigation = useNavigation();
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchActivePlans = async () => {
        try {
          setLoading(true);
          // Fetch workout plan
          const workoutAssignment = await getActiveClientPlanAssignment(client.id, 'workout');
          if (workoutAssignment) {
            const planDetails = await getPlanDetails(workoutAssignment.planId);
            setActiveWorkoutPlan(planDetails);
          } else {
            setActiveWorkoutPlan(null);
          }

          // Fetch meal plan
          const mealAssignment = await getActiveClientPlanAssignment(client.id, 'nutrition');
          if (mealAssignment) {
              const planDetails = await getMealPlanDetails(mealAssignment.planId);
              setActiveMealPlan(planDetails);
          } else {
              setActiveMealPlan(null);
          }
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać aktywnych planów podopiecznego.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchActivePlans();
    }, [client.id])
  );

  const handleAssignWorkoutPlan = () => {
    navigation.navigate('PlanLibrary', { assignToClient: client });
  };

  const handleAssignMealPlan = () => {
    navigation.navigate('MealPlanLibrary', { assignToClient: client });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil Podopiecznego</Text>
      <Text style={styles.clientEmail}>{client.email}</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Aktywny Plan Treningowy</Text>
        {loading ? <ActivityIndicator /> : activeWorkoutPlan ?
          <Text style={styles.planName}>{activeWorkoutPlan.name}</Text> :
          <Text>Brak aktywnego planu treningowego.</Text>
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Aktywny Plan Żywieniowy</Text>
        {loading ? <ActivityIndicator /> : activeMealPlan ?
          <Text style={styles.planName}>{activeMealPlan.name}</Text> :
          <Text>Brak aktywnego planu żywieniowego.</Text>
        }
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Zmień Plan Treningowy" onPress={handleAssignWorkoutPlan} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Zmień Plan Żywieniowy" onPress={handleAssignMealPlan} color="#3B82F6" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    clientEmail: { fontSize: 16, color: 'gray', marginBottom: 30 },
    section: { marginBottom: 20 },
    subHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    planName: { fontSize: 16, fontStyle: 'italic', backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, overflow: 'hidden' },
    buttonContainer: {
        marginTop: 'auto',
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 5,
    }
});

export default ClientProfileScreen;