import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getTrainerPlans, assignPlanToClient } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import SkeletonPlaceholder from '../components/SkeletonPlaceholder';
import { useError } from '../contexts/ErrorContext';

const PlanItemSkeleton = () => (
    <View style={styles.planItem}>
        <SkeletonPlaceholder>
            <View style={{ width: 180, height: 20, borderRadius: 4 }} />
        </SkeletonPlaceholder>
        <View style={{ marginTop: 8 }} />
        <SkeletonPlaceholder>
            <View style={{ width: 250, height: 16, borderRadius: 4 }} />
        </SkeletonPlaceholder>
    </View>
);


const MemoizedPlanItem = React.memo(({ item, handlePlanSelect }) => (
    <TouchableOpacity style={styles.planItem} onPress={() => handlePlanSelect(item)}>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planDescription}>{item.description || 'Brak opisu'}</Text>
    </TouchableOpacity>
));

const PlanLibraryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showError } = useError();
  const { assignToClient } = route.params || {}; // Check if we are in assignment mode

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Change screen title if in assignment mode
  useEffect(() => {
    if (assignToClient) {
      navigation.setOptions({ title: `Wybierz plan dla ${assignToClient.email}` });
    }
  }, [navigation, assignToClient]);

  const fetchPlans = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

      const planList = await getTrainerPlans(currentUser.uid);
      setPlans(planList);
    } catch (error) {
      showError("Nie udało się pobrać planów treningowych.", fetchPlans);
      console.error(error);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPlans().finally(() => setLoading(false));
    }, [fetchPlans])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  }, [fetchPlans]);

  const handlePlanSelect = useCallback(async (plan) => {
    if (assignToClient) {
      // We are in assignment mode
      try {
        const trainerId = auth.currentUser.uid;
        await assignPlanToClient(trainerId, assignToClient.id, plan.id);
        Alert.alert("Sukces!", `Plan "${plan.name}" został przypisany do ${assignToClient.email}.`);
        navigation.goBack(); // Go back to the client's profile
      } catch (error) {
        showError("Nie udało się przypisać planu.");
        console.error(error);
      }
    } else {
      // Normal mode: navigate to plan details (not implemented yet)
      Alert.alert("Informacja", "Widok szczegółów planu w budowie.");
    }
  }, [assignToClient, navigation, showError]);

  const renderPlanItem = ({ item }) => (
    <MemoizedPlanItem item={item} handlePlanSelect={handlePlanSelect} />
  );

  const renderSkeleton = () => (
    <View>
        <PlanItemSkeleton />
        <PlanItemSkeleton />
        <PlanItemSkeleton />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Twoja biblioteka jest pusta</Text>
        <Text style={styles.emptySubtitle}>
            Stwórz swój pierwszy plan treningowy, aby móc przypisywać go swoim podopiecznym.
        </Text>
        {!assignToClient && (
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('PlanBuilder')}
            >
                <Text style={styles.createButtonText}>Stwórz Nowy Plan</Text>
            </TouchableOpacity>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      {!assignToClient && !loading && plans.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Stwórz Nowy Plan Treningowy"
            onPress={() => navigation.navigate('PlanBuilder')}
            color="#22C55E"
          />
        </View>
      )}
      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={plans.length === 0 ? { flex: 1, justifyContent: 'center' } : {}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  planItem: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
  },
  emptySubtitle: {
      fontSize: 16,
      color: 'gray',
      textAlign: 'center',
      marginBottom: 30,
  },
  createButton: {
      backgroundColor: '#22C55E',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
  },
  createButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default PlanLibraryScreen;