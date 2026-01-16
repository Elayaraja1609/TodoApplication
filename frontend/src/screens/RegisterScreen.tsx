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
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
      
      // Show alert for better visibility (works on mobile)
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Success',
          'Registered successfully! Please login to continue.',
          [{ text: 'OK' }]
        );
      }
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      
      // Navigate to login screen after a short delay to show success message
      setTimeout(() => {
        onNavigateToLogin?.();
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle different error types
      if (error.isNetworkError || error.message?.includes('Network error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show error alert - wrapped in try-catch to prevent crashes
      try {
        Alert.alert('Registration Failed', errorMessage);
      } catch (alertError) {
        console.error('Failed to show alert:', alertError);
      }
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
          <Text style={styles.title}>
            {success ? 'Registration Successful!' : 'Sign up'}
          </Text>
          {!success && (
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {success 
            ? 'Your account has been created successfully. Redirecting to login...' 
            : 'Sign up to save your information'}
        </Text>

        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.successText}>Registration successful!</Text>
            <Text style={styles.successSubtext}>Please login to continue</Text>
          </View>
        )}

        {!success && (
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
            disabled={loading || success}
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
        )}
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
  successContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 32,
    backgroundColor: '#065f46',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  successText: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  successSubtext: {
    color: '#6ee7b7',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

