import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import { Todo } from '../types';
import { TodoCard } from '../components/TodoCard';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import { DrawerContent } from '../components/DrawerContent';
import { TaskDetailScreen } from './TaskDetailScreen';
import { CategoriesScreen } from './CategoriesScreen';
import { CalendarViewScreen } from './CalendarViewScreen';
import { SettingsScreen } from './SettingsScreen';
import { createSampleData } from '../utils/sampleData';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface Section {
  id: string;
  title: string;
  color: string;
  todos: Todo[];
}

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'categories' | 'calendar' | 'search' | null>('categories');
  const [drawerMenuSelection, setDrawerMenuSelection] = useState<'main' | 'completed'>('main');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | undefined>(undefined);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['today', 'tomorrow'])); // Today and Tomorrow open by default
  const [autoTransferOverdue, setAutoTransferOverdue] = useState(false); // Auto-transfer preference
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    loadTodos();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const preferences = await apiService.getUserPreferences();
      setAutoTransferOverdue(preferences.autoTransferOverdueTasks);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const loadTodos = async () => {
    try {
      // Try to load from API first
      const apiTodos = await apiService.getTodos();
      setTodos(apiTodos);
      await StorageService.saveTodos(apiTodos);
    } catch (error) {
      // If API fails, load from local storage
      const localTodos = await StorageService.getTodos();
      setTodos(localTodos);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todoId: number) => {
    try {
      await apiService.toggleTodoComplete(todoId);
      await loadTodos(); // Reload todos to get updated state
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      Alert.alert('Error', 'Failed to update task completion status');
    }
  };

  const organizeTodosIntoSections = (): Section[] => {
    // Filter todos based on drawer menu selection
    let filteredTodos = todos;
    if (drawerMenuSelection === 'completed') {
      filteredTodos = todos.filter(todo => todo.isCompleted);
    } else {
      filteredTodos = todos.filter(todo => !todo.isCompleted);
    }

    // Apply search filter if search is active and query is more than 3 characters
    if (selectedFilter === 'search' && searchQuery.trim().length > 3) {
      const query = searchQuery.trim().toLowerCase();
      filteredTodos = filteredTodos.filter(todo => {
        const titleMatch = todo.title.toLowerCase().includes(query);
        const descriptionMatch = todo.description?.toLowerCase().includes(query) || false;
        const categoryMatch = todo.categoryName?.toLowerCase().includes(query) || false;
        const subtaskMatch = todo.subTasks?.some(st => st.title.toLowerCase().includes(query)) || false;
        return titleMatch || descriptionMatch || categoryMatch || subtaskMatch;
      });
    }

    const todayTodos: Todo[] = [];
    const tomorrowTodos: Todo[] = [];
    const thisWeekTodos: Todo[] = [];
    const thisMonthTodos: Todo[] = [];
    const laterTodos: Todo[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    filteredTodos.forEach(todo => {
      if (!todo.dueDate) {
        laterTodos.push(todo);
        return;
      }

      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      // Check if task is overdue (due date is before today and not completed)
      const isOverdue = dueDate < today && !todo.isCompleted;
      
      if (isToday(dueDate)) {
        todayTodos.push(todo);
      } else if (autoTransferOverdue && isOverdue) {
        // If auto-transfer is enabled, move overdue tasks to today section
        todayTodos.push(todo);
      } else if (isTomorrow(dueDate)) {
        tomorrowTodos.push(todo);
      } else if (isThisWeek(dueDate)) {
        thisWeekTodos.push(todo);
      } else if (isThisMonth(dueDate)) {
        thisMonthTodos.push(todo);
      } else {
        laterTodos.push(todo);
      }
    });

    // If showing completed tasks, show them in a single section
    if (drawerMenuSelection === 'completed') {
      const allCompleted = [...todayTodos, ...tomorrowTodos, ...thisWeekTodos, ...thisMonthTodos, ...laterTodos];
      return [
        {
          id: 'completed',
          title: `COMPLETED ${allCompleted.length}`,
          color: '#10b981', // green
          todos: allCompleted,
        },
      ];
    }

    return [
      {
        id: 'today',
        title: `TODAY ${todayTodos.length}/${todayTodos.length}`,
        color: '#10b981', // green
        todos: todayTodos,
      },
      {
        id: 'tomorrow',
        title: `TOMORROW ${tomorrowTodos.length}`,
        color: '#3b82f6', // light blue
        todos: tomorrowTodos,
      },
      {
        id: 'thisWeek',
        title: `DURING THE WEEK ${thisWeekTodos.length}`,
        color: '#8b5cf6', // medium purple
        todos: thisWeekTodos,
      },
      {
        id: 'thisMonth',
        title: `THIS MONTH ${thisMonthTodos.length}`,
        color: '#6366f1', // darker purple
        todos: thisMonthTodos,
      },
      {
        id: 'later',
        title: `LATER ${laterTodos.length}`,
        color: '#ec4899', // magenta
        todos: laterTodos,
      },
    ];
  };

  const sections = organizeTodosIntoSections();
  const hasAnyTodos = todos.length > 0;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* Drawer Overlay - Only covers the right 1/4 of screen */}
      {drawerVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <DrawerContent 
          onClose={closeDrawer}
          onMenuSelect={(menuId) => {
            if (menuId === 'main' || menuId === 'completed') {
              setDrawerMenuSelection(menuId);
            } else if (menuId === 'settings') {
              setSettingsVisible(true);
            }
            closeDrawer();
          }}
        />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome {user?.firstName || ''} {user?.lastName || ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => {
            // Reset to home/main view
            setSelectedFilter(null);
            setSearchQuery('');
            setDrawerMenuSelection('main');
          }}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Navigation/Filter Bar */}
      <View style={styles.filterBar}>
        
        <TouchableOpacity
          style={[styles.filterItem, selectedFilter === 'search' && styles.filterItemActive]}
          onPress={() => {
            if (selectedFilter === 'search') {
              // If search is already active, close it and return to main view
              setSelectedFilter(null);
              setSearchQuery('');
            } else {
              // Open search
              setSelectedFilter('search');
            }
          }}
        >
          <Ionicons name="search" size={20} color={selectedFilter === 'search' ? '#fff' : '#9ca3af'} />
          <Text style={[styles.filterText, selectedFilter === 'search' && styles.filterTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterItem, selectedFilter === 'calendar' && styles.filterItemActive]}
          onPress={() => {
            if (selectedFilter === 'calendar') {
              setSelectedFilter(null);
            } else {
              setSelectedFilter('calendar');
            }
          }}
        >
          <Ionicons name="calendar" size={20} color={selectedFilter === 'calendar' ? '#fff' : '#9ca3af'} />
          <Text style={[styles.filterText, selectedFilter === 'calendar' && styles.filterTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterItem, selectedFilter === 'categories' && styles.filterItemActive]}
          onPress={() => {
            setSelectedFilter('categories');
            setCategoriesVisible(true);
            setSearchQuery(''); // Clear search when switching to categories
          }}
        >
          <Ionicons name="list" size={20} color={selectedFilter === 'categories' ? '#fff' : '#9ca3af'} />
          <Text style={[styles.filterText, selectedFilter === 'categories' && styles.filterTextActive]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input - Show when search filter is selected */}
      {selectedFilter === 'search' && (
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter(null as any);
              setSearchQuery('');
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={selectedFilter === 'search'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Content */}
      {selectedFilter === 'calendar' ? (
        <CalendarViewScreen
          todos={todos}
          onTaskSelect={(todoId) => {
            setSelectedTodoId(todoId);
            setTaskDetailVisible(true);
          }}
          onAddTask={() => {
            setSelectedTodoId(undefined);
            setTaskDetailVisible(true);
          }}
          onRefresh={loadTodos}
        />
      ) : selectedFilter === 'search' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {searchQuery.trim().length > 3 ? (
            sections.length > 0 ? (
              sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <View key={section.id} style={styles.section}>
                    <TouchableOpacity 
                      style={[styles.sectionHeader, { backgroundColor: section.color }]}
                      onPress={() => toggleSection(section.id)}
                    >
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Ionicons 
                        name={isExpanded ? "chevron-down" : "chevron-up"} 
                        size={20} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  
                  {isExpanded && section.todos.length > 0 ? (
                    section.todos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onPress={() => {
                          setSelectedTodoId(todo.id);
                          setTaskDetailVisible(true);
                        }}
                        onToggleComplete={() => handleToggleComplete(todo.id)}
                      />
                    ))
                  ) : null}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tasks found matching "{searchQuery}"</Text>
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim().length > 0 
                  ? 'Type at least 4 characters to search' 
                  : 'Start typing to search for tasks...'}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <View key={section.id} style={styles.section}>
                <TouchableOpacity 
                  style={[styles.sectionHeader, { backgroundColor: section.color }]}
                  onPress={() => toggleSection(section.id)}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              
                {isExpanded && section.todos.length > 0 ? (
                  section.todos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onPress={() => {
                        setSelectedTodoId(todo.id);
                        setTaskDetailVisible(true);
                      }}
                      onToggleComplete={() => handleToggleComplete(todo.id)}
                    />
                  ))
                ) : isExpanded && section.id === 'today' && !hasAnyTodos && drawerMenuSelection === 'main' ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      Tap "+" at the bottom of the screen to add a task
                    </Text>
                  </View>
                ) : isExpanded && section.id === 'completed' && section.todos.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No completed tasks
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Bottom Action Bar - Only show when not in calendar view */}
      {selectedFilter !== 'calendar' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setSelectedTodoId(undefined);
              setTaskDetailVisible(true);
            }}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Task Detail Screen Modal */}
      <Modal
        visible={taskDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setTaskDetailVisible(false);
          setSelectedTodoId(undefined);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setTaskDetailVisible(false);
              setSelectedTodoId(undefined);
            }}
          />
          <View style={styles.modalContainer}>
            <TaskDetailScreen
              todoId={selectedTodoId}
              onClose={() => {
                setTaskDetailVisible(false);
                setSelectedTodoId(undefined);
              }}
              onSave={() => {
                loadTodos();
              }}
              isCompleted={selectedTodoId ? todos.find(t => t.id === selectedTodoId)?.isCompleted : false}
            />
          </View>
        </View>
      </Modal>

              {/* Categories Screen */}
              <CategoriesScreen
                visible={categoriesVisible}
                onClose={() => setCategoriesVisible(false)}
              />

              {/* Settings Screen */}
              {settingsVisible && (
                <View style={styles.fullScreenModal}>
                  <SettingsScreen onClose={() => {
                    setSettingsVisible(false);
                    loadUserPreferences(); // Reload preferences after closing settings
                  }} />
                </View>
              )}
            </View>
          );
        };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: DRAWER_WIDTH, // Start overlay where drawer ends (3/4 of screen)
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1e1b4b',
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  menuButton: {
    padding: 8,
    width: 40, // Fixed width to keep menu button on left
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  homeButton: {
    padding: 8,
    width: 40, // Fixed width to keep home button on right
    height: 40, // Fixed height to match menu button
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedButton: {
    padding: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ec4899',
    borderWidth: 2,
    borderColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterItemActive: {
    // Active state styling if needed
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312e81',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '93%',
    width: '100%',
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e1b4b',
    zIndex: 1000,
  },
  closeSettingsButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    padding: 8,
    zIndex: 1001,
  },
});
