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
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Request notification permissions when app starts
    requestNotificationPermissions();
  }, []);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
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
