import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface HabitSuggestion {
  id: string;
  title: string;
  color: string;
  illustration: string;
}

export const NewHabitScreen: React.FC = () => {
  const navigation = useNavigation();
  const [habitName, setHabitName] = useState('');

  const habitSuggestions: HabitSuggestion[] = [
    { id: '1', title: 'Drink water', color: '#3b82f6', illustration: '💧' },
    { id: '2', title: 'Sports', color: '#06b6d4', illustration: '🏃' },
    { id: '3', title: 'Get up early', color: '#f97316', illustration: '🌅' },
    { id: '4', title: 'Go to bed early', color: '#1e40af', illustration: '🌙' },
    { id: '5', title: 'Yoga', color: '#8b5cf6', illustration: '🧘' },
    { id: '6', title: 'Meditation', color: '#f97316', illustration: '🧘‍♂️' },
    { id: '7', title: 'Read', color: '#3b82f6', illustration: '📚' },
    { id: '8', title: 'Run', color: '#10b981', illustration: '🏃‍♂️' },
    { id: '9', title: 'Walk', color: '#8b5cf6', illustration: '🚶' },
    { id: '10', title: 'Take vitamins', color: '#ec4899', illustration: '💊' },
    { id: '11', title: 'Eat healthy', color: '#10b981', illustration: '🥗' },
  ];

  const handleSelectHabit = (habit: HabitSuggestion) => {
    // Navigate to habit detail or save
    console.log('Selected habit:', habit);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New habit</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Habit Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your habit"
          placeholderTextColor="#9ca3af"
          value={habitName}
          onChangeText={setHabitName}
        />
        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Habit Suggestions */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {habitSuggestions.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={[styles.habitCard, { backgroundColor: habit.color }]}
            onPress={() => handleSelectHabit(habit)}
          >
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustration}>{habit.illustration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312e81',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  inputButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  habitCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  habitTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    fontSize: 60,
  },
});

