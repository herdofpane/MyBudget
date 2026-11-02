import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PortalHost } from '@rn-primitives/portal';
import { AppProviders } from '@/providers';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      <PortalHost />
    </AppProviders>
  );
}
