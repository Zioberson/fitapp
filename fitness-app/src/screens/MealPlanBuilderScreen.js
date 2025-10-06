import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMealPlan } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import { productDatabase } from '../data/productDatabase';

// --- Reusable Component for Nutrition Display ---
const NutritionSummary = ({ nutrition, title }) => (
  <View style={styles.nutritionSummary}>
    {title && <Text style={styles.nutritionTitle}>{title}</Text>}
    <Text>Kcal: {nutrition.calories.toFixed(0)}</Text>
    <Text>B: {nutrition.protein.toFixed(1)}g</Text>
    <Text>T: {nutrition.fat.toFixed(1)}g</Text>
    <Text>W: {nutrition.carbs.toFixed(1)}g</Text>
  </View>
);

const MealPlanBuilderScreen = () => {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState([{ name: 'Śniadanie', recipe: '', ingredients: [] }]);
  const [loading, setLoading] = useState(false);

  // --- Modal State for Product Search ---
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMealIndex, setCurrentMealIndex] = useState(null);

  // --- Nutrition Calculation ---
  const calculateIngredientNutrition = (product, grams) => {
    const factor = grams / 100;
    return {
      calories: (product.calories || 0) * factor,
      protein: (product.protein || 0) * factor,
      fat: (product.fat || 0) * factor,
      carbs: (product.carbs || 0) * factor,
    };
  };

  const totalNutrition = useMemo(() => {
    return meals.reduce((totals, meal) => {
        meal.ingredients.forEach(ing => {
            const nutrition = calculateIngredientNutrition(ing.product, ing.grams);
            totals.calories += nutrition.calories;
            totals.protein += nutrition.protein;
            totals.fat += nutrition.fat;
            totals.carbs += nutrition.carbs;
        });
        return totals;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [meals]);

  const handleIngredientChange = (mealIndex, ingIndex, field, value) => {
    const newMeals = [...meals];
    newMeals[mealIndex].ingredients[ingIndex][field] = value;
    setMeals(newMeals);
  };

  const addMeal = () => setMeals([...meals, { name: `Posiłek ${meals.length + 1}`, recipe: '', ingredients: [] }]);
  const addIngredient = (mealIndex, product) => {
    const newMeals = [...meals];
    newMeals[mealIndex].ingredients.push({ product, grams: '100' });
    setMeals(newMeals);
  };

  const handleSavePlan = async () => {
    if (!planName) {
      Alert.alert("Błąd", "Nazwa planu jest wymagana.");
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

      // Sanitize plan data before saving
      const planData = {
        trainerId: currentUser.uid,
        name: planName,
        description: description,
        totalNutrition,
        meals: meals.map(meal => ({
          ...meal,
          ingredients: meal.ingredients.map(ing => ({
            productId: ing.product.id,
            productName: ing.product.name,
            grams: parseFloat(ing.grams) || 0,
          })),
        })),
      };

      await createMealPlan(planData);
      Alert.alert("Sukces!", "Plan żywieniowy został zapisany.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać planu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = productDatabase.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Kreator Planu Żywieniowego</Text>

      <TextInput style={styles.input} placeholder="Nazwa planu" value={planName} onChangeText={setPlanName} />
      <TextInput style={styles.input} placeholder="Krótki opis" value={description} onChangeText={setDescription} />

      <NutritionSummary nutrition={totalNutrition} title="Całkowite Wartości Odżywcze Planu" />

      {meals.map((meal, mealIndex) => (
        <View key={mealIndex} style={styles.mealContainer}>
          <TextInput style={styles.mealNameInput} value={meal.name} onChangeText={val => {
            const newMeals = [...meals];
            newMeals[mealIndex].name = val;
            setMeals(newMeals);
          }} />
          {meal.ingredients.map((ing, ingIndex) => (
            <View key={ingIndex} style={styles.ingredientRow}>
              <Text style={styles.ingredientText}>{ing.product.name}</Text>
              <TextInput style={styles.gramsInput} value={ing.grams} onChangeText={val => handleIngredientChange(mealIndex, ingIndex, 'grams', val)} keyboardType="numeric" />
              <Text>g</Text>
            </View>
          ))}
          <Button title="+ Dodaj składnik" onPress={() => { setCurrentMealIndex(mealIndex); setModalVisible(true); }} />
        </View>
      ))}

      <Button title="Dodaj kolejny posiłek" onPress={addMeal} />
      <View style={styles.saveButtonContainer}>
        <Button title={loading ? "Zapisywanie..." : "Zapisz Plan Żywieniowy"} onPress={handleSavePlan} disabled={loading} color="#22C55E" />
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Wybierz Produkt</Text>
          <TextInput style={styles.searchInput} placeholder="Szukaj produktu..." value={searchQuery} onChangeText={setSearchQuery} />
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productItem} onPress={() => {
                addIngredient(currentMealIndex, item);
                setModalVisible(false);
                setSearchQuery('');
              }}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Anuluj" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    nutritionSummary: { padding: 15, backgroundColor: '#e6fffa', borderRadius: 8, marginBottom: 15, alignItems: 'center' },
    nutritionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    mealContainer: { padding: 15, borderRadius: 8, backgroundColor: '#f0f0f0', marginBottom: 15 },
    mealNameInput: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 5, marginBottom: 10 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
    ingredientText: { flex: 1, fontSize: 16 },
    gramsInput: { width: 60, padding: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, textAlign: 'center' },
    saveButtonContainer: { marginTop: 20, marginBottom: 40 },
    // Modal styles
    modalContainer: { flex: 1, padding: 20, paddingTop: 50 },
    modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    searchInput: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
    productItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default MealPlanBuilderScreen;