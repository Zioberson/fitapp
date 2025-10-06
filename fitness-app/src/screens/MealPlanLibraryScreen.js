import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getTrainerMealPlans, assignPlanToClient } from '../services/firestoreService';
import { auth } from '../firebaseConfig';

const MealPlanLibraryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assignToClient } = route.params || {}; // Check if we are in assignment mode

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignToClient) {
      navigation.setOptions({ title: `Wybierz plan żywieniowy` });
    }
  }, [navigation, assignToClient]);

  useFocusEffect(
    useCallback(() => {
      const fetchPlans = async () => {
        try {
          setLoading(true);
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

          const planList = await getTrainerMealPlans(currentUser.uid);
          setPlans(planList);
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać planów żywieniowych.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchPlans();
    }, [])
  );

  const handlePlanSelect = async (plan) => {
    if (assignToClient) {
      try {
        const trainerId = auth.currentUser.uid;
        // Assign with type 'nutrition'
        await assignPlanToClient(trainerId, assignToClient.id, plan.id, 'nutrition');
        Alert.alert("Sukces!", `Plan "${plan.name}" został przypisany do ${assignToClient.email}.`);
        navigation.goBack();
      } catch (error) {
        Alert.alert("Błąd", "Nie udało się przypisać planu.");
        console.error(error);
      }
    } else {
      Alert.alert("Informacja", "Widok szczegółów planu w budowie.");
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity style={styles.planItem} onPress={() => handlePlanSelect(item)}>
      <Text style={styles.planName}>{item.name}</Text>
      <Text style={styles.planDescription}>
        {item.totalNutrition.calories.toFixed(0)} kcal, B: {item.totalNutrition.protein.toFixed(0)}g, T: {item.totalNutrition.fat.toFixed(0)}g, W: {item.totalNutrition.carbs.toFixed(0)}g
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#22C55E" />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          ListEmptyComponent={<Text style={styles.emptyListText}>Nie masz jeszcze żadnych planów żywieniowych.</Text>}
          ListHeaderComponent={
            !assignToClient && (
              <Button
                title="Stwórz Nowy Plan Żywieniowy"
                onPress={() => navigation.navigate('MealPlanBuilder')}
                color="#22C55E"
              />
            )
          }
          ListHeaderComponentStyle={{ marginBottom: 20 }}
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});

export default MealPlanLibraryScreen;