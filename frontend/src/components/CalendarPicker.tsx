import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  autoSelect?: boolean; // If true, automatically calls onSelect when date is clicked (but doesn't call onClose)
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
  autoSelect = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(selectedDate || null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(monthStart);
  // Adjust for Monday as first day
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateSelect = (date: Date) => {
    setTempSelectedDate(date);
    // If autoSelect is enabled, immediately call onSelect (but don't close - let parent handle it)
    if (autoSelect) {
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        onSelect(date);
        // Don't call onClose here - let the parent component handle the transition
      }, 100);
    }
  };

  const handleDone = () => {
    if (tempSelectedDate) {
      onSelect(tempSelectedDate);
    } else if (selectedDate) {
      onSelect(selectedDate);
    }
    onClose();
  };

  const handleBack = () => {
    if (tempSelectedDate) {
      onSelect(tempSelectedDate);
    } else if (selectedDate) {
      onSelect(selectedDate);
    }
    onClose();
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  React.useEffect(() => {
    if (visible) {
      setCurrentMonth(selectedDate || new Date());
      setTempSelectedDate(selectedDate || null);
    }
  }, [visible, selectedDate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.monthYear}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: adjustedFirstDay }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const isSelected = tempSelectedDate && isSameDay(day, tempSelectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                  ]}
                  onPress={() => handleDateSelect(day)}
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
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#312e81',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthYear: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  arrowButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
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
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f97316',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

