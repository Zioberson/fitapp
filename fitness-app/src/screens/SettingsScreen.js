import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { getUserDocument, updateUserProfile } from '../services/firestoreService';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialHeight, setInitialHeight] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getUserDocument(currentUser.uid);
        if (userDoc && userDoc.height) {
          const heightStr = userDoc.height.toString();
          setHeight(heightStr);
          setInitialHeight(heightStr);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const heightValue = parseFloat(height);
    if (isNaN(heightValue) || heightValue <= 0) {
      Alert.alert("Błąd", "Proszę wprowadzić poprawny, dodatni wzrost w centymetrach.");
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

      await updateUserProfile(currentUser.uid, { height: heightValue });
      setInitialHeight(height.toString()); // Update initial height to prevent re-saving
      Alert.alert("Sukces!", "Twój wzrost został zaktualizowany.");
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zaktualizować profilu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged in App.js will handle navigation
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił problem podczas wylogowywania.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ustawienia Profilu</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Twój wzrost (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="np. 180"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
        <Text style={styles.description}>
          Wzrost jest potrzebny do automatycznego obliczania wskaźnika BMI.
        </Text>
      </View>

      <Button
        title={loading ? "Zapisywanie..." : "Zapisz Zmiany"}
        onPress={handleSave}
        disabled={loading || height === initialHeight}
        color="#22C55E"
      />

      <View style={styles.logoutButtonContainer}>
        <Button
          title="Wyloguj"
          onPress={handleLogout}
          color="#F59E0B"
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
  },
  description: {
      fontSize: 12,
      color: 'gray',
      marginTop: 5,
      textAlign: 'center',
  },
  logoutButtonContainer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingBottom: 20,
  }
});

export default SettingsScreen;