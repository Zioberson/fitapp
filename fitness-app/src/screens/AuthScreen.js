import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

const AuthScreen = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainer'); // 'trainer' or 'client'
  const [accessCode, setAccessCode] = useState('');

  const handleAuth = () => {
    // Mock authentication logic
    console.log({ email, password, role, accessCode, isLogin });
    // In a real app, you would call Firebase auth functions here
    // For now, we'll just simulate a successful login
    onAuth({ email, role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Logowanie' : 'Rejestracja'}</Text>

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
        />
      )}

      <Button title={isLogin ? 'Zaloguj się' : 'Zarejestruj się'} onPress={handleAuth} />

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
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