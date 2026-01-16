import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PinEntryScreen } from './src/screens/PinEntryScreen';
import { PinSetupScreen } from './src/screens/PinSetupScreen';
import { apiService } from './src/services/api';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notificationService';

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  const appState = useRef(AppState.currentState);
  const pinCheckedRef = useRef(false);

  useEffect(() => {
    // Request notification permissions when app starts
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    // Check if PIN is required when user is authenticated
    // Only check on initial mount, not when app comes back from background
    if (isAuthenticated && user && !pinCheckedRef.current) {
      checkPinRequirement();
      pinCheckedRef.current = true;
    } else if (!isAuthenticated) {
      setCheckingPin(false);
      pinCheckedRef.current = false;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Handle app state changes to prevent PIN check when returning from image picker
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Only check PIN when app comes to foreground if it hasn't been checked yet
      // This prevents PIN screen from showing when returning from image picker
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated &&
        user &&
        !pinCheckedRef.current
      ) {
        // Only check if we haven't checked PIN yet (e.g., app was killed and restarted)
        checkPinRequirement();
        pinCheckedRef.current = true;
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, user]);

  const requestNotificationPermissions = async () => {
    try {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        console.log('Notification permissions granted');
      } else {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  };

  const checkPinRequirement = async () => {
    try {
      // Check if user has PIN set in backend
      // This requires a valid token, so if token is expired, it will fail
      const response = await apiService.hasPin();
      if (response.hasPin) {
        // PIN exists, show PIN entry screen
        setShowPinEntry(true);
      } else {
        // User doesn't have PIN, show setup screen (first-time login)
        setShowPinSetup(true);
      }
    } catch (error: any) {
      console.error('Error checking PIN requirement:', error);
      // If error is 401 (Unauthorized), token might be expired
      // In this case, we should still show PIN entry if user has token stored
      // The PIN verification will handle token refresh if needed
      if (error.response?.status === 401) {
        // Token expired, but user might still have PIN set
        // Check local storage for PIN
        const localPin = await StorageService.getPin();
        if (localPin) {
          // Show PIN entry - if token is expired, user will need to re-login
          setShowPinEntry(true);
        } else {
          // No PIN locally, proceed to home (user will need to re-login if token expired)
          setCheckingPin(false);
        }
      } else {
        // Other error, proceed to home screen
        setCheckingPin(false);
      }
    } finally {
      if (!showPinEntry && !showPinSetup) {
        setCheckingPin(false);
      }
    }
  };

  if (isLoading || checkingPin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Show PIN entry screen if PIN is required
  if (showPinEntry) {
    return (
      <PinEntryScreen
        onSuccess={() => {
          setShowPinEntry(false);
          // PIN was successfully verified, mark as checked for this session
          pinCheckedRef.current = true;
        }}
      />
    );
  }

  // Show PIN setup screen for first-time users
  if (showPinSetup) {
    return (
      <PinSetupScreen
        onComplete={() => {
          setShowPinSetup(false);
        }}
      />
    );
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.appContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#1e1b4b' ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
  },
});
