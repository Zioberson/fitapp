import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getMealPlanDetails } from '../services/firestoreService';
import SkeletonPlaceholder from '../components/SkeletonPlaceholder';
import { useError } from '../contexts/ErrorContext';

// Reusable component for nutrition details
const NutritionDetail = ({ nutrition, title }) => (
  <View style={[styles.nutritionSummary, title ? styles.totalNutrition : styles.mealNutrition]}>
    {title && <Text style={styles.nutritionTitle}>{title}</Text>}
    <Text style={styles.nutritionText}>Kcal: {nutrition.calories.toFixed(0)}</Text>
    <Text style={styles.nutritionText}>Białko: {nutrition.protein.toFixed(1)}g</Text>
    <Text style={styles.nutritionText}>Tłuszcze: {nutrition.fat.toFixed(1)}g</Text>
    <Text style={styles.nutritionText}>Węglowodany: {nutrition.carbs.toFixed(1)}g</Text>
  </View>
);

const MealPlanSkeleton = () => (
    <View style={styles.container}>
        <SkeletonPlaceholder><View style={{ height: 30, width: '70%', alignSelf: 'center', marginBottom: 10 }} /></SkeletonPlaceholder>
        <SkeletonPlaceholder><View style={{ height: 20, width: '90%', alignSelf: 'center', marginBottom: 20 }} /></SkeletonPlaceholder>
        <SkeletonPlaceholder><View style={{ height: 100, width: '100%', borderRadius: 8, marginBottom: 20 }} /></SkeletonPlaceholder>
        <SkeletonPlaceholder><View style={{ height: 200, width: '100%', borderRadius: 8, marginBottom: 15 }} /></SkeletonPlaceholder>
        <SkeletonPlaceholder><View style={{ height: 200, width: '100%', borderRadius: 8, marginBottom: 15 }} /></SkeletonPlaceholder>
    </View>
);

const ClientMealPlanViewScreen = ({ route }) => {
  const { mealPlanId } = route.params;
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  const fetchPlan = useCallback(async () => {
      try {
          setLoading(true);
          const plan = await getMealPlanDetails(mealPlanId);
          if (plan) {
              setMealPlan(plan);
          } else {
              showError("Nie znaleziono planu żywieniowego.");
          }
      } catch (error) {
          showError("Błąd podczas ładowania planu.", fetchPlan);
      } finally {
          setLoading(false);
      }
  }, [mealPlanId, showError]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (loading) {
    return <MealPlanSkeleton />;
  }

  if (!mealPlan) {
    return (
      <View style={styles.container}>
        <Text>Nie znaleziono planu żywieniowego.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.planTitle}>{mealPlan.name}</Text>
      {mealPlan.description && <Text style={styles.planDescription}>{mealPlan.description}</Text>}

      <NutritionDetail nutrition={mealPlan.totalNutrition} title="Podsumowanie Dnia" />

      {mealPlan.meals?.map((meal, mealIndex) => (
        <View key={`meal-${mealIndex}`} style={styles.mealContainer}>
          <Text style={styles.mealTitle}>{meal.name}</Text>

          <Text style={styles.subTitle}>Składniki:</Text>
          {meal.ingredients?.map((ing, ingIndex) => (
            <Text key={`ing-${ingIndex}`} style={styles.ingredientText}>
              - {ing.productName} ({ing.grams}g)
            </Text>
          ))}

          {meal.recipe && (
            <>
              <Text style={styles.subTitle}>Przepis:</Text>
              <Text style={styles.recipeText}>{meal.recipe}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  planTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  planDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  totalNutrition: {
    backgroundColor: '#e6fffa',
    borderColor: '#22C55E',
    borderWidth: 1,
  },
  mealNutrition: {
    backgroundColor: '#f0f0f0',
  },
  nutritionSummary: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  nutritionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  mealContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientText: {
    fontSize: 15,
    marginLeft: 10,
    lineHeight: 22,
  },
  recipeText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default ClientMealPlanViewScreen;