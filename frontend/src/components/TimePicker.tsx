import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: Date) => void;
  selectedTime?: Date | null;
}

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

export const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedTime,
}) => {
  const initialTime = selectedTime || new Date();
  const [hours, setHours] = useState(initialTime.getHours());
  const [minutes, setMinutes] = useState(initialTime.getMinutes());

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const presets = [
    { time: 8, icon: 'sunny', label: '08:00' },
    { time: 15, icon: 'sunny-outline', label: '15:00' },
    { time: 20, icon: 'moon', label: '20:00' },
  ];

  useEffect(() => {
    if (visible) {
      const time = selectedTime || new Date();
      setHours(time.getHours());
      setMinutes(time.getMinutes());
      setTimeout(() => {
        scrollToHour(time.getHours());
        scrollToMinute(time.getMinutes());
      }, 200);
    }
  }, [visible, selectedTime]);

  const handlePreset = (presetHours: number) => {
    setHours(presetHours);
    setMinutes(0);
    scrollToHour(presetHours);
    scrollToMinute(0);
  };

  const handleSave = () => {
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    onSelect(time);
    onClose();
  };

  const scrollToHour = (hour: number) => {
    hoursScrollRef.current?.scrollTo({
      y: hour * ITEM_HEIGHT,
      animated: true,
    });
  };

  const scrollToMinute = (minute: number) => {
    minutesScrollRef.current?.scrollTo({
      y: minute * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <ScrollView
                ref={hoursScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  const newHour = Math.max(0, Math.min(23, index));
                  if (newHour !== hours) {
                    setHours(newHour);
                  }
                }}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  const newHour = Math.max(0, Math.min(23, index));
                  setHours(newHour);
                  scrollToHour(newHour);
                }}
                scrollEventThrottle={16}
              >
                {hoursList.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={styles.pickerItem}
                    onPress={() => {
                      setHours(hour);
                      scrollToHour(hour);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        hours === hour && styles.pickerTextSelected,
                      ]}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.pickerColumn}>
              <ScrollView
                ref={minutesScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  const newMinute = Math.max(0, Math.min(59, index));
                  if (newMinute !== minutes) {
                    setMinutes(newMinute);
                  }
                }}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  const newMinute = Math.max(0, Math.min(59, index));
                  setMinutes(newMinute);
                  scrollToMinute(newMinute);
                }}
                scrollEventThrottle={16}
              >
                {minutesList.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={styles.pickerItem}
                    onPress={() => {
                      setMinutes(minute);
                      scrollToMinute(minute);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        minutes === minute && styles.pickerTextSelected,
                      ]}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Selected Time Display */}
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTime}>
              {hours.toString().padStart(2, '0')} : {minutes.toString().padStart(2, '0')}
            </Text>
          </View>

          {/* Presets */}
          <View style={styles.presets}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.time}
                style={styles.presetItem}
                onPress={() => handlePreset(preset.time)}
              >
                <Ionicons name={preset.icon as any} size={24} color="#9ca3af" />
                <Text style={styles.presetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>SAVE</Text>
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
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: 20,
    position: 'relative',
  },
  pickerColumn: {
    flex: 1,
    height: 200,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 75,
    paddingHorizontal: 8,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: ITEM_HEIGHT,
    paddingVertical: 8,
  },
  pickerText: {
    color: '#9ca3af',
    fontSize: 20,
  },
  pickerTextSelected: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '600',
  },
  separator: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  selectedTimeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  selectedTime: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  presetItem: {
    alignItems: 'center',
    gap: 8,
  },
  presetText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  actions: {
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
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f97316',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

