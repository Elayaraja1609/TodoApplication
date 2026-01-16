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
import { StorageService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

interface PinSetupScreenProps {
  onComplete: () => void;
}

export const PinSetupScreen: React.FC<PinSetupScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PIN and confirmation PIN do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.setupPin({ pin, confirmPin });
      // Save PIN to local storage (for quick verification)
      await StorageService.savePin(pin);
      // Update user data to reflect PIN is set
      if (user) {
        const updatedUser = { ...user, hasPin: true };
        await StorageService.saveUserData(updatedUser);
      }
      
      // Show success message
      setSuccess(true);
      
      // Show alert for better visibility (works on mobile)
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Success',
          'PIN setup successfully!',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }
      
      // Clear form
      setPin('');
      setConfirmPin('');
      
      // Navigate to home after a short delay to show success message
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      console.error('PIN setup error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to setup PIN. Please try again.');
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
        <View style={styles.iconContainer}>
          <Ionicons 
            name={success ? "checkmark-circle" : "lock-closed"} 
            size={64} 
            color={success ? "#10b981" : "#f97316"} 
          />
        </View>
        <Text style={styles.title}>
          {success ? 'PIN Setup Successful!' : 'Setup PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {success 
            ? 'Your PIN has been set successfully. Redirecting to home...' 
            : 'Enter a 4-digit PIN to secure your app'}
        </Text>

        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            <Text style={styles.successText}>PIN setup successfully!</Text>
          </View>
        )}

        {!success && (
          <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#9ca3af"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm PIN"
              placeholderTextColor="#9ca3af"
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading || success}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#4338ca',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 20,
    backgroundColor: '#065f46',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});

