import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserDocument, findTrainerByAccessCode } from '../services/firestoreService';
import { auth } from '../firebaseConfig';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainer'); // 'trainer' or 'client'
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isLogin) {
        // --- Handle Login ---
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged in App.js will handle the navigation
      } else {
        // --- Handle Registration ---
        let trainerId = null;
        if (role === 'client') {
          if (!accessCode) {
            throw new Error("Proszę podać kod dostępu od trenera.");
          }
          trainerId = await findTrainerByAccessCode(accessCode.trim().toUpperCase());
          if (!trainerId) {
            throw new Error("Nie znaleziono trenera z podanym kodem dostępu.");
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;

        // Create user document in Firestore
        await createUserDocument(uid, email, role, trainerId);
      }
    } catch (error) {
      // Improved error handling
      let errorMessage = "Wystąpił nieoczekiwany błąd.";
      if (error.code) {
          switch (error.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
                  errorMessage = "Nieprawidłowy email lub hasło.";
                  break;
              case 'auth/email-already-in-use':
                  errorMessage = "Ten adres email jest już zajęty.";
                  break;
              case 'auth/weak-password':
                  errorMessage = "Hasło powinno mieć co najmniej 6 znaków.";
                  break;
              case 'auth/invalid-email':
                  errorMessage = "Proszę podać poprawny adres email.";
                  break;
              default:
                  errorMessage = error.message;
          }
      } else {
        errorMessage = error.message;
      }
      Alert.alert('Błąd', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Logowanie' : 'Rejestracja'}</Text>

      {!isLogin && (
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'trainer' && styles.roleButtonActive]}
            onPress={() => setRole('trainer')}
          >
            <Text style={styles.roleButtonText}>Jestem Trenerem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
            onPress={() => setRole('client')}
          >
            <Text style={styles.roleButtonText}>Jestem Podopiecznym</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isLogin && role === 'client' && (
        <TextInput
          style={styles.input}
          placeholder="Kod dostępu od trenera"
          value={accessCode}
          onChangeText={setAccessCode}
          autoCapitalize="characters"
        />
      )}

      <Button
        title={loading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}
        onPress={handleAuth}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
        <Text style={styles.switchText}>
          {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: '#22C55E', // primary color
  },
  roleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#3B82F6', // secondary color
  },
});

export default AuthScreen;