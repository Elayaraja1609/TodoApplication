import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinChangeScreen } from './PinChangeScreen';
import { DefaultTaskDateModal } from '../components/DefaultTaskDateModal';
import { FirstDayOfWeekModal } from '../components/FirstDayOfWeekModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { ThemeModal } from '../components/ThemeModal';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';

interface SettingsScreenProps {
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { colors, theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [autoTransfer, setAutoTransfer] = useState(false);
  const [defaultTaskDate, setDefaultTaskDate] = useState<'none' | 'today' | 'tomorrow'>('none');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'default' | 'monday' | 'sunday' | 'saturday'>('default');
  const [notificationReminders, setNotificationReminders] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'default' | 'light' | 'dark'>('default');
  const [showPinChange, setShowPinChange] = useState(false);
  const [showDefaultDateModal, setShowDefaultDateModal] = useState(false);
  const [showFirstDayModal, setShowFirstDayModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const preferences = await apiService.getUserPreferences();
      setAutoTransfer(preferences.autoTransferOverdueTasks);
      setDefaultTaskDate(preferences.defaultTaskDate || 'none');
      setFirstDayOfWeek(preferences.firstDayOfWeek || 'default');
      setNotificationReminders(preferences.enableNotificationReminders ?? true);
      setCurrentTheme(preferences.theme || 'default');
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTransferChange = async (value: boolean) => {
    setAutoTransfer(value);
    try {
      await apiService.updateUserPreferences({
        autoTransferOverdueTasks: value,
        defaultTaskDate: defaultTaskDate,
        firstDayOfWeek: firstDayOfWeek,
        enableNotificationReminders: notificationReminders,
        theme: currentTheme,
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      // Revert on error
      setAutoTransfer(!value);
    }
  };

  const handleDefaultDateChange = async (value: 'none' | 'today' | 'tomorrow') => {
    setDefaultTaskDate(value);
    try {
      await apiService.updateUserPreferences({
        autoTransferOverdueTasks: autoTransfer,
        defaultTaskDate: value,
        firstDayOfWeek: firstDayOfWeek,
        enableNotificationReminders: notificationReminders,
        theme: currentTheme,
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      // Revert on error
      setDefaultTaskDate(defaultTaskDate);
    }
  };

  const handleFirstDayChange = async (value: 'default' | 'monday' | 'sunday' | 'saturday') => {
    setFirstDayOfWeek(value);
    try {
      await apiService.updateUserPreferences({
        autoTransferOverdueTasks: autoTransfer,
        defaultTaskDate: defaultTaskDate,
        firstDayOfWeek: value,
        enableNotificationReminders: notificationReminders,
        theme: currentTheme,
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      // Revert on error
      setFirstDayOfWeek(firstDayOfWeek);
    }
  };

  const handleNotificationChange = async (value: boolean) => {
    setNotificationReminders(value);
    try {
      await apiService.updateUserPreferences({
        autoTransferOverdueTasks: autoTransfer,
        defaultTaskDate: defaultTaskDate,
        firstDayOfWeek: firstDayOfWeek,
        enableNotificationReminders: value,
        theme: currentTheme,
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      // Revert on error
      setNotificationReminders(!value);
    }
  };

  const handleThemeChange = async (value: 'default' | 'light' | 'dark') => {
    setCurrentTheme(value);
    setTheme(value); // Update theme context immediately
    try {
      await apiService.updateUserPreferences({
        autoTransferOverdueTasks: autoTransfer,
        defaultTaskDate: defaultTaskDate,
        firstDayOfWeek: firstDayOfWeek,
        enableNotificationReminders: notificationReminders,
        theme: value,
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      // Revert on error
      setCurrentTheme(currentTheme);
      setTheme(currentTheme);
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return 'Light Theme';
      case 'dark':
        return 'Dark Theme';
      default:
        return 'Default';
    }
  };

  const getDefaultDateLabel = () => {
    switch (defaultTaskDate) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      default:
        return 'Not selected';
    }
  };

  const getFirstDayLabel = () => {
    switch (firstDayOfWeek) {
      case 'monday':
        return 'Monday';
      case 'sunday':
        return 'Sunday';
      case 'saturday':
        return 'Saturday';
      default:
        return 'Default';
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'All your data in the app will be deleted from your device. Do you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all local data
              await StorageService.clearAll();
              // Logout user
              await logout();
              // Note: The app will automatically redirect to login screen after logout
            } catch (error) {
              console.error('Failed to delete all data:', error);
              Alert.alert('Error', 'Failed to delete all data. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const settingsItems = [
    {
      id: 'pin',
      icon: 'lock-closed',
      iconColor: '#f97316',
      label: 'PIN',
      hasArrow: true,
      onPress: () => setShowPinChange(true),
    },
    {
      id: 'autoTransfer',
      icon: 'calendar',
      iconColor: '#8b5cf6',
      label: 'Auto-transfer of overdue tasks',
      hasArrow: false,
      hasSwitch: true,
      value: autoTransfer,
      onValueChange: handleAutoTransferChange,
    },
    {
      id: 'defaultDate',
      icon: 'calendar',
      iconColor: '#3b82f6',
      label: 'Default task date',
      hasArrow: false,
      onPress: () => setShowDefaultDateModal(true),
      value: getDefaultDateLabel(),
    },
    {
      id: 'firstDay',
      icon: 'calendar',
      iconColor: '#10b981',
      label: 'First day of the week',
      hasArrow: false,
      onPress: () => setShowFirstDayModal(true),
      value: getFirstDayLabel(),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      iconColor: '#f97316',
      label: 'Notifications',
      hasArrow: true,
      onPress: () => setShowNotificationsModal(true),
    },
    {
      id: 'theme',
      icon: 'color-palette',
      iconColor: '#8b5cf6',
      label: 'Theme',
      hasArrow: false,
      onPress: () => setShowThemeModal(true),
      value: getThemeLabel(),
    },
    {
      id: 'deleteAll',
      icon: 'trash',
      iconColor: '#ef4444',
      label: 'Delete all the data',
      hasArrow: false,
      onPress: handleDeleteAllData,
    },
  ];

  if (showPinChange) {
    return <PinChangeScreen onClose={() => setShowPinChange(false)} />;
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingsLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    versionText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    valueText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginRight: 8,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Settings List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingsItem, dynamicStyles.settingsItem]}
            onPress={item.onPress}
            disabled={item.hasSwitch}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
              <Ionicons name={item.icon as any} size={20} color="#fff" />
            </View>
            <Text style={[styles.settingsLabel, dynamicStyles.settingsLabel]}>{item.label}</Text>
            {item.hasSwitch ? (
              <Switch
                value={item.value as boolean}
                onValueChange={item.onValueChange}
                trackColor={{ false: '#312e81', true: '#8b5cf6' }}
                thumbColor={item.value ? '#fff' : '#9ca3af'}
              />
            ) : item.hasArrow ? (
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            ) : (item as any).value ? (
              <Text style={[styles.valueText, dynamicStyles.valueText]}>{(item as any).value}</Text>
            ) : null}
          </TouchableOpacity>
        ))
        )}

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, dynamicStyles.versionText]}>Version 0.3.36+125_gp</Text>
        </View>
      </ScrollView>

      {/* Default Task Date Modal */}
      <DefaultTaskDateModal
        visible={showDefaultDateModal}
        onClose={() => setShowDefaultDateModal(false)}
        onSelect={handleDefaultDateChange}
        currentValue={defaultTaskDate}
      />

      {/* First Day of Week Modal */}
      <FirstDayOfWeekModal
        visible={showFirstDayModal}
        onClose={() => setShowFirstDayModal(false)}
        onSelect={handleFirstDayChange}
        currentValue={firstDayOfWeek}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSave={handleNotificationChange}
        currentValue={notificationReminders}
      />

      {/* Theme Modal */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onSelect={handleThemeChange}
        currentValue={currentTheme}
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
  content: {
    flex: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 8,
  },
});

