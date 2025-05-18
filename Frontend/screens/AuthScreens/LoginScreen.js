import React, { useState } from 'react';
import { login } from '../../api/usersApi'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
  
    try {
      const response = await login(username, password);
      console.log('API Response:', response);
  
      if (response?.access_token) {
        await AsyncStorage.setItem('access_token', response.access_token); // Store token
        console.log('Token stored:', response.access_token);
  
        // Navigate to the main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>MyMeds</Text>
          <Text style={styles.subHeader}>Welcome back</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#666"
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
            textAlign="center"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupLink} 
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => console.log('Forgot password')}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: height * 0.06,
    alignItems: 'center',
  },
  header: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#29B9F6',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    gap: height * 0.025,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: height * 0.025,
    borderRadius: 15,
    fontSize: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#0288D1',
    padding: height * 0.025,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: height * 0.02,
    width: '75%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  signupLink: {
    marginTop: height * 0.03,
  },
  signupLinkText: {
    color: '#0288D1',
    fontSize: 16,
  },
  forgotPassword: {
    marginTop: height * 0.02,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
