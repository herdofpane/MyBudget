import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/auth-service';

describe('AuthService - Authentication & Session', () => {
  const service = new AuthService();

  it('successfully logs in with valid email and password', async () => {
    const res = await service.login({
      email: 'test@klyro.app',
      password: 'password123',
    });

    expect(res.user.email).toBe('test@klyro.app');
    expect(res.token).toBeDefined();
  });

  it('throws error when logging in with invalid email format', async () => {
    await expect(
      service.login({
        email: 'invalid-email',
        password: 'password123',
      })
    ).rejects.toThrow('Format email invalide.');
  });

  it('throws error when registering with short password', async () => {
    await expect(
      service.register({
        name: 'Alex',
        email: 'alex@klyro.app',
        password: '123',
      })
    ).rejects.toThrow('Le mot de passe doit comporter au moins 6 caractères.');
  });
});
