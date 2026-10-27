import { describe, it, expect } from 'vitest';
import { notificationsService } from '../notifications.service';

describe('NotificationsService - Local Reminders', () => {
  it('instantiates and provides permission check methods', () => {
    expect(notificationsService).toBeDefined();
    expect(typeof notificationsService.requestPermission).toBe('function');
    expect(typeof notificationsService.hasPermission).toBe('function');
    expect(typeof notificationsService.notifyExpense).toBe('function');
  });

  it('safely handles notification triggers without throwing in non-browser environments', () => {
    expect(() => {
      notificationsService.notifyExpense({
        id: 'test-1',
        expenseName: 'Prêt Immo',
        amount: 850,
        dueDateStr: '2026-11',
      });
    }).not.toThrow();
  });
});
