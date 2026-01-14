import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Todo } from '../types';
import { format } from 'date-fns';

export const CompletedTasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedTodos();
  }, []);

  const loadCompletedTodos = async () => {
    try {
      const allTodos = await apiService.getTodos();
      const completed = allTodos.filter(todo => todo.isCompleted);
      setTodos(completed);
    } catch (error) {
      console.error('Failed to load completed todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTodo = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      style={styles.todoItem}
      onPress={() => {
        // Navigate to task detail
      }}
    >
      <Text style={styles.todoTitle}>{item.title}</Text>
      <View style={styles.todoMeta}>
        {item.dueDate && (
          <>
            <Ionicons name="notifications" size={12} color="#ef4444" />
            <Text style={styles.metaText}>
              {format(new Date(item.dueDate), 'dd/MM/yyyy, HH:mm')}
            </Text>
          </>
        )}
        {item.categoryName && (
          <>
            <Ionicons name="list" size={12} color="#9ca3af" />
          </>
        )}
        {item.recurrencePattern && (
          <>
            <Ionicons name="repeat" size={12} color="#9ca3af" />
          </>
        )}
        {item.description && (
          <>
            <Ionicons name="document-text" size={12} color="#8b5cf6" />
          </>
        )}
        {item.executionTime && (
          <>
            <Ionicons name="time" size={12} color="#10b981" />
            <Text style={styles.metaText}>
              {format(new Date(item.executionTime), 'HH:mm')}
            </Text>
          </>
        )}
      </View>
      <View style={styles.todoActions}>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play-circle" size={24} color="#fff" />
        </TouchableOpacity>
        {item.categoryName && (
          <View style={[styles.categoryBadge, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="home" size={16} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const groupedTodos = filteredTodos.reduce((acc, todo) => {
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    let sectionKey = 'later';
    
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todoDate = new Date(dueDate);
      todoDate.setHours(0, 0, 0, 0);
      
      if (todoDate.getTime() === today.getTime()) {
        sectionKey = 'today';
      }
    }

    if (!acc[sectionKey]) {
      acc[sectionKey] = [];
    }
    acc[sectionKey].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed tasks</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Searching..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <FlatList
        data={Object.entries(groupedTodos)}
        keyExtractor={([key]) => key}
        renderItem={({ item: [sectionKey, sectionTodos] }) => (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: sectionKey === 'today' ? '#22c55e' : '#6366f1' }]}>
              <Text style={styles.sectionTitle}>
                {sectionKey === 'today' ? 'TODAY' : 'COMPLETED'} {sectionTodos.length}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </View>
            {sectionTodos.map((todo) => (
              <View key={todo.id}>
                {renderTodo({ item: todo })}
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No completed tasks</Text>
          </View>
        }
      />
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
  searchBar: {
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
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  todoItem: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    padding: 4,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});

