import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, AppState, AppStateStatus, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { PinEntryScreen } from './src/screens/PinEntryScreen';
import { PinSetupScreen } from './src/screens/PinSetupScreen';
import { NotificationService } from './src/services/notificationService';
import { StorageService } from './src/services/storage';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      {showRegister ? (
        <RegisterScreen
          onNavigateToLogin={() => setShowRegister(false)}
        />
      ) : (
        <LoginScreen
          onNavigateToRegister={() => setShowRegister(true)}
        />
      )}
    </>
  );
}

function MainNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      // When app comes to foreground (from background)
      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        if (navigationRef.current?.isReady()) {
          // Check what screen we were on before going to background
          const lastScreen = await StorageService.getItem('lastActiveScreen');
          
          // DEBUG: Show alert with current state
          Alert.alert(
            'Debug: App State Change',
            `Previous State: ${previousState}\nCurrent State: ${nextAppState}\nLast Active Screen: ${lastScreen || 'null'}\n\nAction: ${lastScreen === 'TaskDetail' ? 'Staying on TaskDetail' : 'Navigating to Home'}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (lastScreen === 'TaskDetail') {
                    // Stay on TaskDetail screen - don't navigate
                    // React Navigation should preserve the screen state automatically
                    console.log('Preserving TaskDetail screen state');
                  } else {
                    // Navigate to Home if we were on Home or no state stored
                    const nav = navigationRef.current;
                    if (nav && nav.isReady()) {
                      nav.navigate('Home');
                    }
                  }
                }
              }
            ]
          );
        }
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1e1b4b' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

type RootStackParamList = {
  Home: undefined;
  TaskDetail: { todoId?: number; isCompleted?: boolean };
};

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  const [pinChecked, setPinChecked] = useState(false);
  const pinUnlockedRef = useRef(false);
  const pinCheckedRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // Request notification permissions when app starts
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && !pinCheckedRef.current) {
      checkPinRequirement();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Listen for app state changes to check PIN when app comes to foreground
    const sub = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      // When app goes to background, clear PIN unlock status
      if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
        if (isAuthenticated && user?.hasPin) {
          // Clear PIN unlock status when app goes to background
          await StorageService.setPinUnlocked(false);
          pinUnlockedRef.current = false;
        }
      }

      // When app comes to foreground (from background)
      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        if (isAuthenticated && user) {
          await checkPinUnlockStatus();
        }
      }
    });
    return () => sub.remove();
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
    if (pinCheckedRef.current) return;
    
    setCheckingPin(true);
    pinCheckedRef.current = true;

    try {
      // Check if user has PIN set
      const hasPin = user?.hasPin || false;
      
      if (hasPin) {
        // Check if PIN is already unlocked
        const isUnlocked = await StorageService.getPinUnlocked();
        pinUnlockedRef.current = isUnlocked;
        
        if (!isUnlocked) {
          // Show PIN entry screen
          setShowPinEntry(true);
        }
      } else {
        // User doesn't have PIN, show setup screen (optional - can skip)
        // For now, we'll skip PIN setup and let them set it from settings
        // setShowPinSetup(true);
      }
    } catch (error) {
      console.error('Error checking PIN requirement:', error);
    } finally {
      setCheckingPin(false);
      setPinChecked(true);
    }
  };

  const checkPinUnlockStatus = async () => {
    if (!user?.hasPin) return;

    try {
      const isUnlocked = await StorageService.getPinUnlocked();
      pinUnlockedRef.current = isUnlocked;
      
      if (!isUnlocked) {
        // PIN is locked, show PIN entry screen
        setShowPinEntry(true);
      }
    } catch (error) {
      console.error('Error checking PIN unlock status:', error);
    }
  };

  const handlePinSuccess = async () => {
    await StorageService.setPinUnlocked(true);
    pinUnlockedRef.current = true;
    setShowPinEntry(false);
  };

  const handlePinSetupComplete = async () => {
    setShowPinSetup(false);
    // After PIN setup, check if we need to show PIN entry
    // (usually we don't, but just in case)
    await checkPinRequirement();
  };

  if (isLoading || (isAuthenticated && checkingPin)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Show PIN entry screen if user has PIN and it's not unlocked
  if (showPinEntry && user?.hasPin) {
    return <PinEntryScreen onSuccess={handlePinSuccess} />;
  }

  // Show PIN setup screen if user doesn't have PIN (optional)
  if (showPinSetup && !user?.hasPin) {
    return <PinSetupScreen onComplete={handlePinSetupComplete} />;
  }

  return <MainNavigator />;
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
