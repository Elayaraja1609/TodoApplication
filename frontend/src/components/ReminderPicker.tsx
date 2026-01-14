import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarPicker } from './CalendarPicker';
import { TimePicker } from './TimePicker';

interface ReminderPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date, time: Date) => void;
  selectedDate?: Date | null;
  selectedTime?: Date | null;
}

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
  selectedTime,
}) => {
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate || null);
  const [tempTime, setTempTime] = useState<Date | null>(selectedTime || null);

  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate || null);
      setTempTime(selectedTime || null);
      // Always start with date picker
      setStep('date');
    } else {
      // Reset when closed
      setStep('date');
    }
  }, [visible]);

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    // Automatically move to time picker after date selection
    // Use a delay to ensure the calendar picker state is updated
    setTimeout(() => {
      setStep('time');
    }, 200);
  };

  const handleTimeSelect = (time: Date) => {
    setTempTime(time);
    if (tempDate) {
      onSelect(tempDate, time);
      onClose();
      setStep('date');
    }
  };

  const handleDateClose = () => {
    // If closing date picker without selection, close everything
    // But if we have a date selected, don't close - just move to time
    if (tempDate) {
      setStep('time');
    } else {
      onClose();
      setStep('date');
    }
  };

  const handleTimeClose = () => {
    // If closing time picker, go back to date or close if no date selected
    if (tempDate) {
      setStep('date');
    } else {
      onClose();
      setStep('date');
    }
  };


  return (
    <>
      {/* Date Picker Step */}
      <CalendarPicker
        visible={visible && step === 'date'}
        onClose={handleDateClose}
        onSelect={handleDateSelect}
        selectedDate={tempDate}
        autoSelect={true}
      />

      {/* Time Picker Step */}
      <TimePicker
        visible={visible && step === 'time'}
        onClose={handleTimeClose}
        onSelect={handleTimeSelect}
        selectedTime={tempTime}
      />
    </>
  );
};
