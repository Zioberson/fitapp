import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../firebaseConfig';
import { getUserDocument, addMeasurement, uploadImageAndGetURL } from '../services/firestoreService';

const AddMeasurementScreen = () => {
  const navigation = useNavigation();
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [biceps, setBiceps] = useState('');
  const [thighs, setThighs] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInput = () => {
    const newErrors = {};
    const numberRegex = /^[0-9]+(\.[0-9]{1,2})?$/;

    if (!weight.trim()) {
        newErrors.weight = "Waga jest wymagana.";
    } else if (!numberRegex.test(weight) || parseFloat(weight) <= 0) {
        newErrors.weight = "Wprowadź poprawną, dodatnią wartość wagi.";
    }

    if (chest && (!numberRegex.test(chest) || parseFloat(chest) <= 0)) {
        newErrors.chest = "Wprowadź poprawną, dodatnią wartość.";
    }
    if (waist && (!numberRegex.test(waist) || parseFloat(waist) <= 0)) {
        newErrors.waist = "Wprowadź poprawną, dodatnią wartość.";
    }
    if (biceps && (!numberRegex.test(biceps) || parseFloat(biceps) <= 0)) {
        newErrors.biceps = "Wprowadź poprawną, dodatnią wartość.";
    }
    if (thighs && (!numberRegex.test(thighs) || parseFloat(thighs) <= 0)) {
        newErrors.thighs = "Wprowadź poprawną, dodatnią wartość.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const calculateBmi = (userHeight, userWeight) => {
    if (!userHeight || !userWeight) return null;
    const heightInMeters = userHeight / 100;
    return (userWeight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const handleSave = async () => {
    if (!validateInput()) {
        return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

      const userDoc = await getUserDocument(currentUser.uid);
      if (!userDoc || !userDoc.height) {
        Alert.alert("Brak danych", "Proszę najpierw ustawić swój wzrost w Ustawieniach, aby obliczyć BMI.");
        setLoading(false);
        return;
      }

      let photoUrl = null;
      if (image) {
        photoUrl = await uploadImageAndGetURL(image, currentUser.uid);
      }

      const bmi = calculateBmi(userDoc.height, parseFloat(weight));

      const measurementData = {
        weight: parseFloat(weight),
        bmi: parseFloat(bmi),
        dimensions: {
          chest: parseFloat(chest) || null,
          waist: parseFloat(waist) || null,
          biceps: parseFloat(biceps) || null,
          thighs: parseFloat(thighs) || null,
        },
        photoUrl,
      };

      await addMeasurement(currentUser.uid, measurementData);
      Alert.alert("Sukces!", "Nowy pomiar został zapisany.");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać pomiaru.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dodaj Nowy Pomiar</Text>

      <Text style={styles.label}>Waga (kg)*</Text>
      <TextInput style={[styles.input, errors.weight && styles.inputError]} placeholder="Waga" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

      <Text style={styles.label}>Obwody (cm)</Text>
      <TextInput style={[styles.input, errors.chest && styles.inputError]} placeholder="Klatka piersiowa" value={chest} onChangeText={setChest} keyboardType="numeric" />
      {errors.chest && <Text style={styles.errorText}>{errors.chest}</Text>}
      <TextInput style={[styles.input, errors.waist && styles.inputError]} placeholder="Talia" value={waist} onChangeText={setWaist} keyboardType="numeric" />
      {errors.waist && <Text style={styles.errorText}>{errors.waist}</Text>}
      <TextInput style={[styles.input, errors.biceps && styles.inputError]} placeholder="Biceps" value={biceps} onChangeText={setBiceps} keyboardType="numeric" />
      {errors.biceps && <Text style={styles.errorText}>{errors.biceps}</Text>}
      <TextInput style={[styles.input, errors.thighs && styles.inputError]} placeholder="Udo" value={thighs} onChangeText={setThighs} keyboardType="numeric" />
      {errors.thighs && <Text style={styles.errorText}>{errors.thighs}</Text>}

      <Text style={styles.label}>Zdjęcie Progresu (opcjonalnie)</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>{image ? "Zmień zdjęcie" : "Wybierz zdjęcie"}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.saveButtonText}>Zapisz Pomiar</Text>
            )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 10, marginTop: 15 },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 7,
  },
  inputError: {
    borderColor: '#ff4d4d',
  },
  errorText: {
      color: '#ff4d4d',
      marginBottom: 10,
      marginLeft: 5,
  },
  imagePicker: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    borderRadius: 8,
    marginTop: 15,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  }
});

export default AddMeasurementScreen;