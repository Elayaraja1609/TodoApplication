import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

export const checkApiConnectivity = async (apiUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true;
  } catch (error) {
    console.error('API connectivity check failed:', error);
    return false;
  }
};

