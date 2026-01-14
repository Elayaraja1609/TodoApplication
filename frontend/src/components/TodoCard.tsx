import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Todo } from '../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface TodoCardProps {
  todo: Todo;
  onPress: () => void;
  onToggleComplete?: () => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onPress, onToggleComplete }) => {
  const handleCheckboxPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when clicking checkbox
    onToggleComplete?.();
  };

  return (
    <TouchableOpacity style={[styles.card, todo.isCompleted && styles.cardCompleted]} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[styles.checkbox, todo.isCompleted && styles.checkboxCompleted]}
            onPress={handleCheckboxPress}
          >
            {todo.isCompleted && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <View style={styles.textSection}>
            <Text
              style={[
                styles.title,
                todo.isCompleted && styles.titleCompleted,
              ]}
            >
              {todo.title}
            </Text>
            <View style={styles.meta}>
              {todo.dueDate && (
                <>
                  <Ionicons name="calendar-outline" size={14} color={todo.isCompleted ? '#6b7280' : '#9ca3af'} />
                  <Text style={[styles.date, todo.isCompleted && styles.dateCompleted]}>
                    {format(new Date(todo.dueDate), 'dd/MM/yyyy')}
                  </Text>
                </>
              )}
              {todo.executionTime && (
                <>
                  <Ionicons name="time-outline" size={14} color={todo.isCompleted ? '#6b7280' : '#9ca3af'} />
                  <Text style={[styles.time, todo.isCompleted && styles.timeCompleted]}>
                    {format(new Date(todo.executionTime), 'HH:mm')}
                  </Text>
                </>
              )}
              {todo.isImportant && (
                <Ionicons name="flag" size={14} color="#ef4444" />
              )}
              {todo.recurrencePattern && (
                <Ionicons name="repeat" size={14} color="#10b981" />
              )}
              {todo.subTasks && todo.subTasks.length > 0 && (
                <Ionicons name="list" size={14} color="#6366f1" />
              )}
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={16} color="#fff" />
          </TouchableOpacity>
          {todo.categoryName && (
            <View style={[styles.categoryBadge, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="home" size={14} color="#fff" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#312e81',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 12,
  },
  cardCompleted: {
    backgroundColor: '#1f2937', // Gray background for completed tasks
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#8b5cf6',
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 6,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: '#9ca3af', // Gray text for completed tasks
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  date: {
    fontSize: 11,
    color: '#ef4444',
    marginLeft: 4,
  },
  dateCompleted: {
    color: '#6b7280', // Gray for completed tasks
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 4,
  },
  timeCompleted: {
    color: '#6b7280', // Gray for completed tasks
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

