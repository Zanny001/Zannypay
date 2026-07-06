import { Platform, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://zannypay-backend.onrender.com/api/v1';

// Token Management
export const getSavedToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('userToken');
  return await SecureStore.getItemAsync('userToken');
};

export const saveToken = async (token) => {
  if (Platform.OS === 'web') localStorage.setItem('userToken', token);
  else await SecureStore.setItemAsync('userToken', token);
};

export const clearToken = async () => {
  if (Platform.OS === 'web') localStorage.removeItem('userToken');
  else await SecureStore.deleteItemAsync('userToken');
};

// USSD Fallback Interceptor
const triggerUssdFallback = (fallbackConfig) => {
  if (!fallbackConfig) return;
  const { type, amount, account } = fallbackConfig;
  
  let ussdString = '';
  // *999* is a generic placeholder. In production, you'd map this to the specific bank code (e.g., *737* for GTB).
  if (type === 'transfer') ussdString = `*999*${amount}*${account}#`; 
  else if (type === 'airtime') ussdString = `*999*${amount}#`;
  else return;

  // iOS/Android require the '#' to be URL-encoded as '%23' for dialer links
  const encodedUssd = ussdString.replace('#', '%23');

  Alert.alert(
    'Network Connection Dropped 📡',
    `We couldn't reach the server. Would you like to complete this transaction securely offline via USSD?\n\nCode: ${ussdString}`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dial Code', onPress: () => Linking.openURL(`tel:${encodedUssd}`) }
    ]
  );
};

// API Fetch Helpers
export const apiGet = async (endpoint) => {
  try {
    const savedToken = await getSavedToken();
    const headers = { 'Content-Type': 'application/json' };
    if (savedToken) headers.Authorization = `Bearer ${savedToken}`;

    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.message || 'API GET request failed');
    return data;
  } catch (error) {
    throw error;
  }
};

export const apiPost = async (endpoint, payload, fallbackConfig = null) => {
  try {
    const savedToken = await getSavedToken();
    const headers = { 'Content-Type': 'application/json' };
    if (savedToken) headers.Authorization = `Bearer ${savedToken}`;

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.message || 'API POST request failed');
    return data;
  } catch (error) {
    // Intercept network failures (fetch throws TypeError on network drops)
    if (error.name === 'TypeError' || error.message.includes('Network request failed')) {
      if (fallbackConfig) triggerUssdFallback(fallbackConfig);
      throw new Error('Network offline. Attempting USSD fallback.');
    }
    throw error;
  }
};

