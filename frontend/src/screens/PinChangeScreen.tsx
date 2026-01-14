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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';

interface PinChangeScreenProps {
  onClose: () => void;
}

export const PinChangeScreen: React.FC<PinChangeScreenProps> = ({ onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (currentPin.length < 4) {
      Alert.alert('Error', 'Please enter your current PIN');
      return;
    }

    if (newPin.length < 4) {
      Alert.alert('Error', 'New PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PIN and confirmation PIN do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePin({
        currentPin,
        newPin,
        confirmPin,
      });
      // Update local storage
      await StorageService.savePin(newPin);
      // Show success message and navigate back
      Alert.alert(
        'Success',
        'PIN changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');
              // Navigate back to settings
              onClose();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('PIN change error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change PIN</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current PIN"
              placeholderTextColor="#9ca3af"
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new PIN"
              placeholderTextColor="#9ca3af"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new PIN"
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
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Change PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
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
});

