import React, { useState } from 'react';
import { signup } from '../../api/usersApi';
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

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    // Basic validation
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      const response = await signup(username, password);  // Call the API
      console.log('Signup successful:', response);
      
      // Navigate to the main app upon successful signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
  
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>MyMeds</Text>
          <Text style={styles.subHeader}>Create your account</Text>
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#666"
            textAlign="center"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? Login
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
  loginLink: {
    marginTop: height * 0.03,
  },
  loginLinkText: {
    color: '#0288D1',
    fontSize: 16,
  },
});

export default SignUpScreen;
