import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { colors } from '@/theme/colors';

export type DialogType =
  | 'confirm'
  | 'destructive'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface AppDialogProps {
  visible: boolean;
  type?: DialogType;
  title: string;
  message: string;
  highlightText?: string;
  subtext?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const TYPE_CONFIG = {
  confirm: {
    icon: 'help-circle-outline' as const,
    color: colors.primary,
    bg: 'rgba(15, 23, 42, 0.08)',
    btnBg: colors.primary,
  },
  destructive: {
    icon: 'trash-outline' as const,
    color: colors.danger,
    bg: 'rgba(248, 113, 113, 0.12)',
    btnBg: colors.danger,
  },
  success: {
    icon: 'checkmark-circle-outline' as const,
    color: colors.accent,
    bg: 'rgba(16, 185, 129, 0.12)',
    btnBg: colors.accent,
  },
  error: {
    icon: 'alert-circle-outline' as const,
    color: colors.danger,
    bg: 'rgba(248, 113, 113, 0.12)',
    btnBg: colors.danger,
  },
  warning: {
    icon: 'alert-circle-outline' as const,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    btnBg: colors.primary,
  },
  info: {
    icon: 'information-circle-outline' as const,
    color: colors.accent,
    bg: 'rgba(16, 185, 129, 0.12)',
    btnBg: colors.primary,
  },
};

export function AppDialog({
  visible,
  type = 'confirm',
  title,
  message,
  highlightText,
  subtext,
  confirmLabel = 'Compris',
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: AppDialogProps) {
  // Support touche Échap sur le Web pour fermer le pop-up
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        else onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, isLoading, onCancel, onConfirm]);

  const effectiveType: DialogType = isDestructive ? 'destructive' : type;
  const config = TYPE_CONFIG[effectiveType] || TYPE_CONFIG.confirm;
  const isSingleButton = !cancelLabel;

  const handleDismiss = () => {
    if (isLoading) return;
    if (onCancel) onCancel();
    else onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}>
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            {/* BOUTON FERMER DISCRET EN HAUT À DROITE */}
            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.7}
              disabled={isLoading}
              style={[styles.closeBtn, isLoading && { opacity: 0.5 }]}
              accessibilityLabel="Fermer la boîte de dialogue">
              <Ionicons name="close" size={18} color="#5C5264" />
            </TouchableOpacity>

            <View style={styles.content}>
              {/* ICÔNE DANS BULLE TEINTÉE */}
              <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon} size={28} color={config.color} />
              </View>

              {/* TITRE PRINCIPAL */}
              <Text style={styles.title}>{title}</Text>

              {/* MESSAGE DE LA BOÎTE */}
              <Text style={styles.message}>
                {message}
                {highlightText ? (
                  <Text style={styles.highlightText}> « {highlightText} »</Text>
                ) : null}
              </Text>

              {/* SOUS-TEXTE CONTEXTUEL SI FOURNI */}
              {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
            </View>

            {/* BOUTONS D'ACTION DU POP-UP */}
            <View style={styles.actions}>
              {!isSingleButton && onCancel && (
                <TouchableOpacity
                  onPress={onCancel}
                  disabled={isLoading}
                  activeOpacity={0.7}
                  style={[styles.cancelBtn, isLoading && { opacity: 0.5 }]}>
                  <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onConfirm}
                disabled={isLoading}
                activeOpacity={0.85}
                style={[
                  styles.confirmBtn,
                  { backgroundColor: config.btnBg },
                  isSingleButton && { flex: 1 },
                  isLoading && { opacity: 0.8 },
                ]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    {effectiveType === 'destructive' && (
                      <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                    )}
                    {effectiveType === 'success' && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </>
                )}
                <Text style={styles.confirmBtnText}>
                  {isLoading ? 'En cours...' : confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// Composant de compatibilité existant pour les dialogues de confirmation
export function ConfirmDialog({
  visible,
  title,
  message,
  highlightText,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AppDialog
      visible={visible}
      type={isDestructive ? 'destructive' : 'confirm'}
      title={title}
      message={message}
      highlightText={highlightText}
      subtext={isDestructive ? 'Cette action est irréversible.' : undefined}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      isDestructive={isDestructive}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.50)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardWrap: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  highlightText: {
    fontWeight: '800',
    color: Colors.light.text,
  },
  subtext: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

