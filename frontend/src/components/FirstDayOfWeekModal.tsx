import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FirstDayOfWeekModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: 'default' | 'monday' | 'sunday' | 'saturday') => void;
  currentValue: 'default' | 'monday' | 'sunday' | 'saturday';
}

export const FirstDayOfWeekModal: React.FC<FirstDayOfWeekModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentValue,
}) => {
  const [selectedValue, setSelectedValue] = useState<'default' | 'monday' | 'sunday' | 'saturday'>(currentValue);

  const options = [
    { value: 'default' as const, label: 'Default' },
    { value: 'monday' as const, label: 'Monday' },
    { value: 'sunday' as const, label: 'Sunday' },
    { value: 'saturday' as const, label: 'Saturday' },
  ];

  const handleDone = () => {
    onSelect(selectedValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>First day of the week</Text>
          
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionRow}
                onPress={() => setSelectedValue(option.value)}
              >
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedValue === option.value && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedValue === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.buttonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
  modalContainer: {
    backgroundColor: '#312e81',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1b4b',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#f97316',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
  },
  optionLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

