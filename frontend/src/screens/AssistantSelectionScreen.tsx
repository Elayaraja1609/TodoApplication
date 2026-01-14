import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const AssistantSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedAssistant, setSelectedAssistant] = useState<string>('maria');

  const assistants = [
    {
      id: 'maria',
      name: 'Maria',
      avatar: '👩',
      selected: selectedAssistant === 'maria',
    },
    {
      id: 'maxim',
      name: 'Maxim',
      avatar: '👨',
      selected: selectedAssistant === 'maxim',
    },
    {
      id: 'none',
      name: 'No assistant',
      icon: 'apps',
      selected: selectedAssistant === 'none',
    },
  ];

  const handleSelect = (id: string) => {
    setSelectedAssistant(id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select an assistant</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Assistant Options */}
        <View style={styles.assistantsRow}>
          {assistants.slice(0, 2).map((assistant) => (
            <TouchableOpacity
              key={assistant.id}
              style={styles.assistantOption}
              onPress={() => handleSelect(assistant.id)}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{assistant.avatar}</Text>
              </View>
              <Text style={styles.assistantName}>{assistant.name}</Text>
              <View style={[styles.radioButton, assistant.selected && styles.radioButtonSelected]}>
                {assistant.selected && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* No Assistant Option */}
        <TouchableOpacity
          style={styles.noAssistantOption}
          onPress={() => handleSelect('none')}
        >
          <View style={styles.noAssistantIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Ionicons name="cart" size={24} color="#f97316" />
            <Ionicons name="home" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.assistantName}>No assistant</Text>
          <View style={[styles.radioButton, selectedAssistant === 'none' && styles.radioButtonSelected]}>
            {selectedAssistant === 'none' && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            // Save selection and go back
            navigation.goBack();
          }}
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  assistantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  assistantOption: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  assistantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  radioButtonSelected: {
    borderColor: '#fff',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  noAssistantOption: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  noAssistantIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});

