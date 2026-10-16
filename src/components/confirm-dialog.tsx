import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  highlightText,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDestructive
                    ? 'rgba(212, 63, 94, 0.12)'
                    : 'rgba(155, 111, 186, 0.12)',
                },
              ]}>
              <Ionicons
                name={isDestructive ? 'trash-outline' : 'help-circle-outline'}
                size={26}
                color={isDestructive ? '#d43f5e' : '#9b6fba'}
              />
            </View>

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.message}>
              {message}
              {highlightText ? (
                <Text style={styles.highlightText}> « {highlightText} » </Text>
              ) : null}
              ?
            </Text>
            <Text style={styles.subtext}>Cette action est irréversible.</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              style={[
                styles.confirmBtn,
                { backgroundColor: isDestructive ? '#d43f5e' : '#9b6fba' },
              ]}>
              {isDestructive && <Ionicons name="trash" size={16} color="#ffffff" />}
              <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 20, 36, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e6dfd3',
    shadowColor: '#1b1424',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#231c2b',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#65576f',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: '800',
    color: '#231c2b',
  },
  subtext: {
    fontSize: 12,
    color: '#95899e',
    marginTop: 4,
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
    height: 46,
    borderRadius: 14,
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#ded6c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#65576f',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#d43f5e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
