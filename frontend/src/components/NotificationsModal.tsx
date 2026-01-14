import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: boolean) => void;
  currentValue: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onSave,
  currentValue,
}) => {
  const [notificationEnabled, setNotificationEnabled] = useState(currentValue);

  useEffect(() => {
    if (visible) {
      setNotificationEnabled(currentValue);
    }
  }, [visible, currentValue]);

  const handleDone = () => {
    onSave(notificationEnabled);
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
          <Text style={styles.modalTitle}>Notifications</Text>
          
          <View style={styles.contentContainer}>
            <Text style={styles.descriptionText}>
              Do you want notification reminders?
            </Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {notificationEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: '#312e81', true: '#8b5cf6' }}
                thumbColor={notificationEnabled ? '#fff' : '#9ca3af'}
              />
            </View>
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
  contentContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
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

