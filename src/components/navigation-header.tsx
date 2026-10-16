import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';

export type NavRoute = 'index' | 'fixed-expenses' | 'variable-expenses' | 'details';

interface NavHeaderProps {
  currentRoute?: NavRoute;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function NavigationHeader({
  title,
  subtitle,
  actionButton,
}: NavHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {actionButton ? <View style={styles.actionWrapper}>{actionButton}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#f4f0e8',
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c6f85',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#231c2b',
    marginTop: 2,
  },
  actionWrapper: {
    marginLeft: 12,
  },
});
