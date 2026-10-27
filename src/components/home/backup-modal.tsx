import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetBackup } from '@/hooks/use-budget-backup';
import { useBudget } from '@/hooks/use-budget';
import { generateBudgetCsv, downloadTextFile } from '@/utils/csv-export';

interface BackupModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function BackupModal({ visible, onClose }: BackupModalProps): React.JSX.Element {
  const {
    isProcessing,
    feedback,
    clearFeedback,
    exportBackupToJson,
    importBackupFromJson,
    resetToDefaults,
  } = useBudgetBackup();

  const { budget, fixedExpensesList, variableCategories } = useBudget();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportJson = () => {
    const jsonStr = exportBackupToJson();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(`fintrack-backup-${dateStr}.json`, jsonStr, 'application/json');
  };

  const handleExportCsv = () => {
    const csvStr = generateBudgetCsv(budget, fixedExpensesList, variableCategories);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(`fintrack-budget-${dateStr}.csv`, csvStr, 'text/csv');
  };

  const handleFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        await importBackupFromJson(content);
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  const triggerImport = () => {
    clearFeedback();
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      Alert.alert('Import', 'Sélectionnez un fichier JSON de sauvegarde.');
    }
  };

  const handleReset = async () => {
    await resetToDefaults();
    setConfirmReset(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center">
                <Ionicons name="cloud-upload-outline" size={20} color="#818cf8" />
              </View>
              <Text className="text-lg font-bold text-slate-100">Données & Sauvegarde</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Feedback Banner */}
          {feedback && (
            <View
              className={`p-3 rounded-2xl mb-4 border flex-row items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <Ionicons
                name={feedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={feedback.type === 'success' ? '#34d399' : '#f87171'}
              />
              <Text className="text-xs font-medium flex-1 text-slate-200">{feedback.message}</Text>
            </View>
          )}

          {/* Action List */}
          <View className="space-y-3">
            {/* Export JSON */}
            <TouchableOpacity
              onPress={handleExportJson}
              disabled={isProcessing}
              className="min-h-[48px] px-4 py-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl flex-row items-center justify-between active:bg-slate-700/70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="download-outline" size={20} color="#38bdf8" />
                <View>
                  <Text className="text-sm font-semibold text-slate-200">Exporter en JSON</Text>
                  <Text className="text-xs text-slate-400">Sauvegarde intégrale pour restauration</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            {/* Export CSV */}
            <TouchableOpacity
              onPress={handleExportCsv}
              disabled={isProcessing}
              className="min-h-[48px] px-4 py-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl flex-row items-center justify-between active:bg-slate-700/70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="document-text-outline" size={20} color="#34d399" />
                <View>
                  <Text className="text-sm font-semibold text-slate-200">Exporter en CSV (Excel)</Text>
                  <Text className="text-xs text-slate-400">Tableau récapitulatif lisible</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            {/* Import JSON */}
            <TouchableOpacity
              onPress={triggerImport}
              disabled={isProcessing}
              className="min-h-[48px] px-4 py-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl flex-row items-center justify-between active:bg-slate-700/70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="folder-open-outline" size={20} color="#a78bfa" />
                <View>
                  <Text className="text-sm font-semibold text-slate-200">Importer un fichier JSON</Text>
                  <Text className="text-xs text-slate-400">Restaurer un budget sauvegardé</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>

            {/* Reset */}
            {!confirmReset ? (
              <TouchableOpacity
                onPress={() => setConfirmReset(true)}
                className="min-h-[48px] px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex-row items-center justify-between active:bg-rose-500/20"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                  <Text className="text-sm font-semibold text-rose-400">Réinitialiser les données</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
              </TouchableOpacity>
            ) : (
              <View className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl">
                <Text className="text-xs text-rose-300 font-medium mb-3">
                  Attention : cette action réinitialise tout le budget aux valeurs par défaut.
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setConfirmReset(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 items-center justify-center min-h-[44px]"
                  >
                    <Text className="text-xs font-semibold text-slate-300">Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleReset}
                    className="flex-1 py-2 rounded-xl bg-rose-600 items-center justify-center min-h-[44px]"
                  >
                    <Text className="text-xs font-semibold text-white">Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {isProcessing && (
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#818cf8" />
              <Text className="text-xs text-slate-400">Traitement en cours...</Text>
            </View>
          )}

          {Platform.OS === 'web' && (
            <input
              type="file"
              ref={fileInputRef as unknown as React.LegacyRef<HTMLInputElement>}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFilePicked}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
