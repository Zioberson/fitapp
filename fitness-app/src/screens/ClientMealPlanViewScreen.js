import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

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

const ClientMealPlanViewScreen = ({ route }) => {
  const { mealPlan } = route.params;

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

          {/* Note: Per-meal nutrition would require recalculation here or storing it within the meal object itself */}
          {/* For now, we're focusing on the total daily nutrition as per the current structure. */}
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