import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
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
    if (!weight) {
      Alert.alert("Błąd", "Waga jest wymaganym polem.");
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
      <TextInput style={styles.input} placeholder="Waga" value={weight} onChangeText={setWeight} keyboardType="numeric" />

      <Text style={styles.label}>Obwody (cm)</Text>
      <TextInput style={styles.input} placeholder="Klatka piersiowa" value={chest} onChangeText={setChest} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Talia" value={waist} onChangeText={setWaist} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Biceps" value={biceps} onChangeText={setBiceps} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Udo" value={thighs} onChangeText={setThighs} keyboardType="numeric" />

      <Text style={styles.label}>Zdjęcie Progresu (opcjonalnie)</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>{image ? "Zmień zdjęcie" : "Wybierz zdjęcie"}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <View style={styles.buttonContainer}>
        <Button title={loading ? "Zapisywanie..." : "Zapisz Pomiar"} onPress={handleSave} disabled={loading} color="#22C55E" />
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
  }
});

export default AddMeasurementScreen;