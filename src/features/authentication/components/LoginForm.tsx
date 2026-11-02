import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors } from '@/theme/colors';
import { useLogin } from '../hooks/use-login';

function LoginFormHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Connexion</Text>
      <Text style={styles.subtitle}>Accédez à vos données budgétaires sécurisées</Text>
    </View>
  );
}

interface FormFieldsProps {
  email: string;
  setEmail: (val: string) => void;
  pass: string;
  setPass: (val: string) => void;
}

function LoginFormFields(props: FormFieldsProps) {
  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Adresse Email</Text>
        <Input
          placeholder="exemple@domaine.com"
          value={props.email}
          onChangeText={props.setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mot de passe</Text>
        <Input
          placeholder="••••••••"
          value={props.pass}
          onChangeText={props.setPass}
          secureTextEntry
          style={styles.input}
        />
      </View>
    </>
  );
}

interface FormActionsProps {
  onSubmit: () => void;
  onGuest: () => void;
  isLoading: boolean;
}

function LoginFormActions(props: FormActionsProps) {
  return (
    <>
      <Button onPress={props.onSubmit} disabled={props.isLoading} style={styles.submitButton}>
        {props.isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Se connecter</Text>
        )}
      </Button>
      <Button variant="ghost" onPress={props.onGuest} style={styles.guestButton}>
        <Text style={styles.guestButtonText}>Continuer en mode local (Hors-ligne)</Text>
      </Button>
    </>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { executeLogin, isLoading, errorMessage } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return setFormError('Veuillez renseigner vos identifiants.');
    setFormError(null);
    try {
      await executeLogin({ email: email.trim(), password });
      router.replace('/(tabs)' as Href);
    } catch {
      // Handled in hook
    }
  };

  return (
    <Card style={styles.cardContainer}>
      <LoginFormHeader />
      {(formError || errorMessage) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{formError || errorMessage}</Text>
        </View>
      )}
      <LoginFormFields email={email} setEmail={setEmail} pass={password} setPass={setPassword} />
      <LoginFormActions onSubmit={handleSubmit} onGuest={() => router.replace('/(tabs)' as Href)} isLoading={isLoading} />
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    width: '100%',
    maxWidth: 420,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
  },
  submitButton: {
    minHeight: 46,
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  guestButton: {
    minHeight: 44,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});
