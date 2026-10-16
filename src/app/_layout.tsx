import '../global.css';
import { useEffect } from 'react';
import { ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={NAV_THEME.dark}>
      <View style={{ flex: 1, backgroundColor: '#090d16' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#090d16' },
          }}
        />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}
