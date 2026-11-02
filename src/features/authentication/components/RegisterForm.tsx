import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors } from '@/theme/colors';
import { authService } from '../services/auth-service';
import { useAuth } from '@/providers';

function RegisterFormHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Inscription</Text>
      <Text style={styles.subtitle}>Créez votre compte Klyro</Text>
    </View>
  );
}

interface RegisterInputsProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  pass: string;
  setPass: (v: string) => void;
}

function RegisterInputs(props: RegisterInputsProps) {
  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nom complet</Text>
        <Input placeholder="Jean Dupont" value={props.name} onChangeText={props.setName} style={styles.input} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Adresse Email</Text>
        <Input placeholder="jean@email.com" value={props.email} onChangeText={props.setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mot de passe (6 car. min.)</Text>
        <Input placeholder="••••••••" value={props.pass} onChangeText={props.setPass} secureTextEntry style={styles.input} />
      </View>
    </>
  );
}

interface RegisterActionsProps {
  onSubmit: () => void;
  onLogin: () => void;
  isLoading: boolean;
}

function RegisterActions(props: RegisterActionsProps) {
  return (
    <>
      <Button onPress={props.onSubmit} disabled={props.isLoading} style={styles.submitButton}>
        {props.isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.submitButtonText}>Créer mon compte</Text>}
      </Button>
      <Button variant="ghost" onPress={props.onLogin} style={styles.loginLink}>
        <Text style={styles.loginLinkText}>Déjà un compte ? Se connecter</Text>
      </Button>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) return setError('Veuillez renseigner tous les champs.');
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.register({ name: name.trim(), email: email.trim(), password });
      await login(res.user.email, res.token);
      router.replace('/(tabs)' as Href);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Échec inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={styles.cardContainer}>
      <RegisterFormHeader />
      {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}
      <RegisterInputs name={name} setName={setName} email={email} setEmail={setEmail} pass={password} setPass={setPassword} />
      <RegisterActions onSubmit={handleSubmit} onLogin={() => router.push('/auth/login' as Href)} isLoading={isLoading} />
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
  loginLink: {
    minHeight: 44,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});
