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
import { colors } from '@/theme/colors';

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
        size={22}
        color={focused ? colors.accent : (color || colors.textMuted)}
      />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch((err) => {
      console.warn('[RootLayout] Impossible de masquer le splashscreen:', err);
    });
  }, []);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = width >= 768;
  const isNarrow = width < 420;

  const containerWidth = isDesktop ? Math.min(width, 960) : width;
  const horizontalMargin = isDesktop ? 32 : isNarrow ? 14 : 20;
  const maxDock = isDesktop ? 580 : 500;
  const dockWidth = Math.min(containerWidth - horizontalMargin, maxDock);
  const dockLeft = (containerWidth - dockWidth) / 2;

  // Hauteur et espacement du footer optimisés pour que le texte et les icônes soient parfaitement lisibles et confortables
  const dockBottom = isDesktop
    ? 16
    : isWeb
    ? 12
    : Math.max(insets.bottom, 12);

  const tabBarHeight = isDesktop ? 74 : 70;
  const tabBarPaddingBottom = isDesktop ? 8 : 6;
  const tabBarPaddingTop = isDesktop ? 8 : 6;

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
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: isDesktop ? 26 : 22,
                  height: tabBarHeight,
                  paddingBottom: tabBarPaddingBottom,
                  paddingTop: tabBarPaddingTop,
                  position: 'absolute',
                  bottom: dockBottom,
                  left: dockLeft,
                  width: dockWidth,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: isDesktop ? 4 : 2 },
                  shadowOpacity: isDesktop ? 0.08 : 0.06,
                  shadowRadius: isDesktop ? 16 : 10,
                  elevation: 8,
                },
                tabBarItemStyle: {
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 2,
                  paddingHorizontal: 2,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                  fontSize: isNarrow ? 11 : 12,
                  fontWeight: '700',
                  marginTop: 2,
                  marginBottom: 0,
                  lineHeight: 14,
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
                title: isNarrow ? 'Fixes' : 'Charges Fixes',
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
                title: isNarrow ? 'Calcul' : 'Calcul & Détail',
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
    backgroundColor: colors.background,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        } as any)
      : {}),
  },
  appContainer: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        } as any)
      : {}),
  },
  iconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: '#ECFDF5',
  },
});
