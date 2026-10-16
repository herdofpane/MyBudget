import '../global.css';
import { useEffect } from 'react';
import { Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortalHost } from '@rn-primitives/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_THEME } from '@/lib/theme';
import { BudgetProvider } from '@/hooks/use-budget';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}

function TabIcon({ name, focusedName, focused, color }: TabIconProps) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerFocused,
      ]}>
      <Ionicons
        name={focused ? focusedName : name}
        size={20}
        color={focused ? '#9b6fba' : (color || '#7c6f85')}
      />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isIos = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const isDesktop = width >= 768;

  const containerWidth = isDesktop ? Math.min(width, 960) : width;
  const dockWidth = isDesktop ? Math.min(containerWidth - 32, 580) : width;
  const dockLeft = isDesktop ? (containerWidth - dockWidth) / 2 : 0;

  const tabBarHeight = isIos
    ? 64 + insets.bottom
    : isDesktop
    ? 80
    : isWeb
    ? 84
    : 78 + (insets.bottom > 0 ? insets.bottom : 8);

  const tabBarPaddingBottom = isIos
    ? Math.max(insets.bottom, 16)
    : isDesktop
    ? 12
    : isWeb
    ? 14
    : insets.bottom > 0
    ? insets.bottom + 6
    : 12;

  return (
    <BudgetProvider>
      <ThemeProvider value={NAV_THEME.light}>
        <View style={styles.rootWrapper}>
          <View style={[styles.appContainer, { maxWidth: isDesktop ? 960 : '100%' }]}>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                  backgroundColor: '#ffffff',
                  borderTopColor: '#e6dfd3',
                  borderTopWidth: 1,
                  borderBottomWidth: isDesktop ? 1 : 0,
                  borderBottomColor: '#e6dfd3',
                  borderLeftWidth: isDesktop ? 1 : 0,
                  borderLeftColor: '#e6dfd3',
                  borderRightWidth: isDesktop ? 1 : 0,
                  borderRightColor: '#e6dfd3',
                  borderRadius: isDesktop ? 24 : 0,
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  height: tabBarHeight,
                  paddingBottom: tabBarPaddingBottom,
                  paddingTop: 6,
                  position: 'absolute',
                  bottom: isDesktop ? 16 : 0,
                  left: dockLeft,
                  width: isDesktop ? dockWidth : '100%',
                  right: isDesktop ? undefined : 0,
                  shadowColor: '#231c2b',
                  shadowOffset: { width: 0, height: isDesktop ? 4 : -3 },
                  shadowOpacity: isDesktop ? 0.12 : 0.08,
                  shadowRadius: isDesktop ? 14 : 10,
                  elevation: isDesktop ? 10 : 8,
                },
                tabBarItemStyle: {
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 6,
                  paddingBottom: 6,
                },
                tabBarActiveTintColor: '#9b6fba',
                tabBarInactiveTintColor: '#7c6f85',
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '700',
                  marginTop: 3,
                  marginBottom: 0,
                },
              }}>
            {/* 1. ACCUEIL */}
            <Tabs.Screen
              name="index"
              options={{
                title: 'Accueil',
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    name="home-outline"
                    focusedName="home"
                    focused={focused}
                    color={color as string}
                  />
                ),
              }}
            />

            {/* 2. HISTORIQUE CHARGES FIXES */}
            <Tabs.Screen
              name="fixed-expenses"
              options={{
                title: 'Charges Fixes',
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    name="calendar-outline"
                    focusedName="calendar"
                    focused={focused}
                    color={color as string}
                  />
                ),
              }}
            />

            {/* 3. ESTIMATION CHARGES VARIABLES */}
            <Tabs.Screen
              name="variable-expenses"
              options={{
                title: 'Variables',
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    name="pie-chart-outline"
                    focusedName="pie-chart"
                    focused={focused}
                    color={color as string}
                  />
                ),
              }}
            />

            {/* 4. CALCUL ET DETAIL */}
            <Tabs.Screen
              name="details"
              options={{
                title: 'Calcul & Détail',
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    name="calculator-outline"
                    focusedName="calculator"
                    focused={focused}
                    color={color as string}
                  />
                ),
              }}
            />

            {/* Hidden screens */}
            <Tabs.Screen
              name="explore"
              options={{
                href: null,
              }}
            />
          </Tabs>
          <PortalHost />
        </View>
      </View>
    </ThemeProvider>
  </BudgetProvider>
);
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#f4f0e8',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
  },
  iconContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(155, 111, 186, 0.15)',
  },
});
