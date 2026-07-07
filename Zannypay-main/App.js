import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SyncEngine } from './src/services/SyncEngine';

export default function App() {
  // Fire the Sync Engine on startup to process any offline actions
  useEffect(() => {
    SyncEngine.processQueue();
  }, []);

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </WalletProvider>
    </SafeAreaProvider>
  );
}

