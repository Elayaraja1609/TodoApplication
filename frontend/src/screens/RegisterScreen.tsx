import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Register the user (but don't auto-login)
      await apiService.register({ firstName, lastName, email, password });
      
      // Show success message
      Alert.alert(
        'Success',
        'Registered successfully! Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setFirstName('');
              setLastName('');
              setEmail('');
              setPassword('');
              // Navigate to login screen
              onNavigateToLogin?.();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your connection and ensure the backend is running.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Sign up</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Sign up to save your information</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#9ca3af"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#9ca3af"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigateToLogin?.()}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>LOG IN</Text>
          </TouchableOpacity>

          <Text style={styles.socialText}>Log in with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>f</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipText}>Continue without creating an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  linkButton: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '600',
  },
  socialText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 16,
  },
  skipText: {
    color: '#f97316',
    fontSize: 14,
    textAlign: 'center',
  },
});

