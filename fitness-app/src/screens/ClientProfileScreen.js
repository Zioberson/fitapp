import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getActiveClientPlanAssignment, getPlanDetails } from '../services/firestoreService';

const ClientProfileScreen = ({ route }) => {
  const { client } = route.params; // Get client data passed via navigation
  const navigation = useNavigation();
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect ensures the active plan is re-fetched if we navigate back
  // to this screen after assigning a new one.
  useFocusEffect(
    useCallback(() => {
      const fetchActivePlan = async () => {
        try {
          setLoading(true);
          const assignment = await getActiveClientPlanAssignment(client.id);
          if (assignment) {
            const planDetails = await getPlanDetails(assignment.planId);
            setActivePlan(planDetails);
          } else {
            setActivePlan(null);
          }
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać aktywnego planu podopiecznego.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchActivePlan();
    }, [client.id])
  );

  const handleAssignPlan = () => {
    // Navigate to PlanLibrary to select a plan. Pass the client's data
    // so the library knows we are in "assignment mode".
    navigation.navigate('PlanLibrary', {
      assignToClient: client,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil Podopiecznego</Text>
      <Text style={styles.clientEmail}>{client.email}</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Aktywny Plan Treningowy</Text>
        {loading ? (
          <ActivityIndicator color="#22C55E" />
        ) : activePlan ? (
          <Text style={styles.planName}>{activePlan.name}</Text>
        ) : (
          <Text>Brak aktywnego planu.</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Przypisz lub Zmień Plan"
          onPress={handleAssignPlan}
          color="#3B82F6"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    clientEmail: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 30,
    },
    section: {
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    planName: {
        fontSize: 16,
        fontStyle: 'italic',
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
    },
    buttonContainer: {
        marginTop: 'auto',
        paddingVertical: 20,
    }
});

export default ClientProfileScreen;