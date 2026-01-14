import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecurrenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (pattern: string, nextDate: Date) => void;
  currentPattern?: string | null;
}

export const RecurrenceModal: React.FC<RecurrenceModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentPattern,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string>(currentPattern || 'daily');
  const [selectedValue, setSelectedValue] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('day');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const patterns = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom period' },
  ];

  const units = [
    { value: 'day', label: 'day' },
    { value: 'week', label: 'week' },
    { value: 'month', label: 'month' },
  ];

  const weekDays = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
  ];

  const calculateNextDate = (pattern: string, value: number, unit: string): Date => {
    const next = new Date();
    if (pattern === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (pattern === 'weekly') {
      // Find next occurrence based on selected days
      if (selectedDays.length > 0) {
        const today = new Date().getDay();
        const sortedDays = [...selectedDays].sort((a, b) => a - b);
        const nextDay = sortedDays.find(day => day > today) || sortedDays[0];
        const daysUntil = nextDay > today ? nextDay - today : (7 - today) + nextDay;
        next.setDate(next.getDate() + daysUntil);
      } else {
        next.setDate(next.getDate() + 7);
      }
    } else if (pattern === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (pattern === 'custom') {
      if (unit === 'day') next.setDate(next.getDate() + value);
      else if (unit === 'week') next.setDate(next.getDate() + value * 7);
      else if (unit === 'month') next.setMonth(next.getMonth() + value);
    }
    return next;
  };

  const handleDone = () => {
    const nextDate = calculateNextDate(selectedPattern, selectedValue, selectedUnit);
    onSelect(selectedPattern, nextDate);
    onClose();
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const getPatternLabel = () => {
    if (selectedPattern === 'daily') return 'Every day';
    if (selectedPattern === 'weekly') return 'Weekly';
    if (selectedPattern === 'monthly') return 'Monthly';
    return 'Custom period';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Specify the period</Text>

          {selectedPattern === 'custom' ? (
            <View style={styles.customSection}>
              <View style={styles.pickerRow}>
                <ScrollView style={styles.pickerColumn}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.pickerItem,
                        selectedValue === num && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedValue(num)}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          selectedValue === num && styles.pickerTextSelected,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView style={styles.pickerColumn}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit.value}
                      style={[
                        styles.pickerItem,
                        selectedUnit === unit.value && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedUnit(unit.value)}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          selectedUnit === unit.value && styles.pickerTextSelected,
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : selectedPattern === 'weekly' ? (
            <View style={styles.weeklySection}>
              <Text style={styles.patternTitle}>Weekly</Text>
              <Text style={styles.patternSubtitle}>Choose days of the week</Text>
              <View style={styles.daysGrid}>
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.value) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    {selectedDays.includes(day.value) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.value) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.patternSection}>
              <Text style={styles.patternTitle}>{getPatternLabel()}</Text>
            </View>
          )}

          <View style={styles.tabs}>
            {patterns.map((pattern) => (
              <TouchableOpacity
                key={pattern.value}
                style={[
                  styles.tab,
                  selectedPattern === pattern.value && styles.tabActive,
                ]}
                onPress={() => setSelectedPattern(pattern.value)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPattern === pattern.value && styles.tabTextActive,
                  ]}
                >
                  {pattern.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectButton} onPress={handleDone}>
              <Text style={styles.selectButtonText}>SELECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#312e81',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  customSection: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    padding: 16,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
  },
  pickerText: {
    color: '#9ca3af',
    fontSize: 18,
  },
  pickerTextSelected: {
    color: '#f97316',
    fontWeight: '600',
  },
  patternSection: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  weeklySection: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  patternTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  patternSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  dayButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: '#f97316',
    borderColor: '#fff',
  },
  dayButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4338ca',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '600',
  },
});

