import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CalendarIntegrationScreen from './src/view/pages/CalendarIntegrationScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <CalendarIntegrationScreen />
    </SafeAreaProvider>
  );
}