import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { Todo } from '../types';

interface CalendarViewScreenProps {
  todos: Todo[];
  onTaskSelect?: (todoId: number) => void;
  onAddTask?: () => void;
  onRefresh?: () => void;
}

export const CalendarViewScreen: React.FC<CalendarViewScreenProps> = ({
  todos,
  onTaskSelect,
  onAddTask,
  onRefresh,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  useEffect(() => {
    // Auto-select today's date on mount
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, []);

  const selectedDateTodos = selectedDate
    ? todos.filter(todo => {
        if (!todo.dueDate && !todo.startDate) return false;
        const todoDate = new Date(todo.dueDate || todo.startDate!);
        return isSameDay(todoDate, selectedDate);
      })
    : [];

  return (
    <View style={styles.container}>
      {/* Fixed Header - Removed search bar */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Banner */}
        <View style={styles.calendarBanner}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavButton}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.monthYearContainer}>
            <Text style={styles.monthYear}>{format(currentMonth, '< MMMM yyyy')}</Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {Array.from({ length: adjustedFirstDay }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {daysInMonth.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const hasTodos = todos.some(todo => {
                if (!todo.dueDate && !todo.startDate) return false;
                const todoDate = new Date(todo.dueDate || todo.startDate!);
                return isSameDay(todoDate, day);
              });

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[styles.dayCell, isSelected && styles.selectedDay]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isToday && !isSelected && styles.todayText,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  {hasTodos && <View style={styles.todoDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Section */}
        {selectedDate && (
          <View style={styles.todosSection}>
            <Text style={styles.todosSectionTitle}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
            
            {selectedDateTodos.length > 0 ? (
              selectedDateTodos.map((todo) => (
                <TouchableOpacity 
                  key={todo.id} 
                  style={styles.todoItem}
                  onPress={() => onTaskSelect?.(todo.id)}
                >
                  <View style={[styles.todoCheckbox, todo.isCompleted && styles.todoCheckboxCompleted]}>
                    {todo.isCompleted && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={styles.todoContent}>
                    <Text style={[styles.todoTitle, todo.isCompleted && styles.todoTitleCompleted]}>
                      {todo.title}
                    </Text>
                    <View style={styles.todoMeta}>
                      {todo.isImportant && (
                        <Ionicons name="notifications" size={14} color="#ef4444" />
                      )}
                      {todo.subTasks && todo.subTasks.length > 0 && (
                        <Ionicons name="list" size={14} color="#9ca3af" />
                      )}
                      {todo.recurrencePattern && (
                        <Ionicons name="repeat" size={14} color="#9ca3af" />
                      )}
                      {todo.description && (
                        <Ionicons name="document-text" size={14} color="#8b5cf6" />
                      )}
                      {(todo.dueDate || todo.startDate) && (
                        <Text style={styles.metaText}>
                          {format(new Date(todo.dueDate || todo.startDate!), 'dd/MM/yyyy')}
                        </Text>
                      )}
                      {todo.executionTime && (
                        <>
                          <Ionicons name="time" size={14} color="#10b981" />
                          <Text style={styles.metaText}>
                            {format(new Date(todo.executionTime), 'HH:mm')}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={styles.todoActions}>
                    <TouchableOpacity>
                      <Ionicons name="play-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                    {todo.categoryId && (
                      <View style={[styles.categoryBadge, { backgroundColor: '#8b5cf6' }]}>
                        <Ionicons name={todo.categoryName?.toLowerCase() as any || 'home'} size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateText}>No tasks for this date</Text>
                <TouchableOpacity 
                  style={styles.addTaskButton}
                  onPress={onAddTask}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addTaskButtonText}>Add new task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#1e1b4b',
    zIndex: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  calendarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    minHeight: 80,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYear: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#f97316',
    borderRadius: 20,
  },
  dayText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    color: '#f97316',
    fontWeight: '600',
  },
  todoDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  todosSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  todosSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  todoItem: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCheckboxCompleted: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 2,
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#312e81',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

