import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface DrawerContentProps {
  navigation?: any;
  onClose?: () => void;
  onMenuSelect?: (menuId: string) => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ onClose, onMenuSelect }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const menuItems = [
    { id: 'main', label: 'Main Screen', icon: 'home', color: '#fff' },
    { id: 'completed', label: 'Completed tasks', icon: 'checkmark-circle', color: '#fff' },
    // { id: 'habits', label: 'Habit Diary', icon: 'time', color: '#fff' },
    { id: 'settings', label: 'Settings', icon: 'settings', color: '#fff' },
  ];

  const appItems = [
    { id: 'rate', label: 'Rate the app', icon: 'star', color: '#f97316' },
    { id: 'contact', label: 'Contact the support team', icon: 'mail', color: '#f97316' },
    { id: 'share', label: 'Share with friends', icon: 'share', color: '#f97316' },
    { id: 'apps', label: 'Our applications', icon: 'apps', color: '#f97316' },
  ];

  const handleItemPress = (id: string) => {
    // Handle navigation
    console.log('Navigate to:', id);
    onMenuSelect?.(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#9ca3af" />
          </View>
          <Text style={styles.userText}>{user?.firstName || ''} {user?.lastName || ''}</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Main Navigation Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleItemPress(item.id)}
            >
              <Ionicons name={item.icon as any} size={24} color={item.color} />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* App-Related Actions - Fixed at bottom */}
      <View style={styles.appSection}>
        {appItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleItemPress(item.id)}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuSection: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  appSection: {
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#312e81',
    backgroundColor: '#1e1b4b',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
});

