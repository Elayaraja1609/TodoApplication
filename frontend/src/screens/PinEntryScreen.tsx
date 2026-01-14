import React, { useState, useRef, useEffect } from 'react';
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

interface PinEntryScreenProps {
  onSuccess: () => void;
}

export const PinEntryScreen: React.FC<PinEntryScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handlePinChange = async (text: string) => {
    setPin(text);
    setError(false);

    // Auto-submit when PIN length reaches 4 or more
    if (text.length >= 4) {
      await verifyPin(text);
    }
  };

  const verifyPin = async (pinToVerify: string) => {
    setLoading(true);
    try {
      // First try local storage for quick verification (offline capability)
      const storedPin = await StorageService.getPin();
      if (storedPin && storedPin === pinToVerify) {
        // Local verification successful, try to verify with backend if token is valid
        try {
          const response = await apiService.verifyPin({ pin: pinToVerify });
          if (response.isValid) {
            setPin('');
            // PIN verified successfully, navigate directly to home
            onSuccess();
            return;
          }
        } catch (backendError: any) {
          // If backend verification fails (e.g., token expired), 
          // but local PIN matches, we can still allow access
          // The token will be refreshed on next API call if needed
          console.warn('Backend PIN verification failed, but local PIN matches:', backendError);
          setPin('');
          // PIN verified locally, navigate directly to home
          onSuccess();
          return;
        }
      } else {
        // Try backend verification (requires valid token)
        const response = await apiService.verifyPin({ pin: pinToVerify });
        if (response.isValid) {
          // Save to local storage for next time
          await StorageService.savePin(pinToVerify);
          setPin('');
          // PIN verified successfully, navigate directly to home
          onSuccess();
          return;
        }
      }

      // PIN is incorrect
      setError(true);
      setPin('');
      Alert.alert('Error', 'Incorrect PIN. Please try again.');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error: any) {
      console.error('PIN verification error:', error);
      // If error is 401 (Unauthorized), token might be expired
      if (error.response?.status === 401) {
        // Check if local PIN matches as fallback
        const storedPin = await StorageService.getPin();
        if (storedPin && storedPin === pinToVerify) {
          // Local PIN matches, allow access (token will be refreshed on next API call)
          setPin('');
          onSuccess();
          return;
        }
        Alert.alert('Session Expired', 'Your session has expired. Please login again.');
        // You might want to redirect to login here
      } else {
        setError(true);
        setPin('');
        Alert.alert('Error', 'Failed to verify PIN. Please try again.');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'Please enter at least 4 digits');
      return;
    }
    await verifyPin(pin);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={error ? '#ef4444' : '#f97316'} />
        </View>
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>

        <View style={styles.form}>
          <TextInput
            ref={inputRef}
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter PIN"
            placeholderTextColor="#9ca3af"
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={10}
            autoFocus
          />

          {loading && (
            <ActivityIndicator
              size="large"
              color="#f97316"
              style={styles.loader}
            />
          )}

          <TouchableOpacity
            style={[styles.button, pin.length < 4 && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || pin.length < 4}
          >
            <Text style={styles.buttonText}>Verify</Text>
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
  input: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#4338ca',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  loader: {
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

