import { Platform } from 'react-native';
import { formatEuro } from '@/constants/formatters';

export interface ExpenseReminderPayload {
  readonly id: string;
  readonly expenseName: string;
  readonly amount: number;
  readonly dueDateStr: string; // YYYY-MM or YYYY-MM-DD
}

/**
 * Isolated notification service (SOLID Layer 3)
 * Manages local reminders for fixed charges and loan installments.
 */
class NotificationsService {
  /**
   * Requests permission to trigger browser or device notifications.
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      const status = await Notification.requestPermission();
      return status === 'granted';
    }
    return false;
  }

  /**
   * Checks if notification permission is currently granted.
   */
  hasPermission(): boolean {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  /**
   * Triggers an immediate local reminder alert.
   */
  notifyExpense(reminder: ExpenseReminderPayload): void {
    const title = `FinTrack — Échéance à venir`;
    const body = `${reminder.expenseName} (${formatEuro(reminder.amount)}) arrive à échéance le mois prochain.`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: './favicon.png',
        });
      }
    }
  }
}

export const notificationsService = new NotificationsService();
