import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

export class AuthService {
  /**
   * Authenticates user with credentials (supports offline/local mock).
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email et mot de passe requis.');
    }
    if (!credentials.email.includes('@')) {
      throw new Error('Format email invalide.');
    }
    // Simulate secure network latency or local validation
    return {
      user: {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: credentials.email.trim().toLowerCase(),
        name: credentials.email.split('@')[0],
      },
      token: 'jwt_mock_token_' + Date.now(),
    };
  }

  /**
   * Registers a new user.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (!credentials.name.trim() || !credentials.email.trim() || !credentials.password) {
      throw new Error('Tous les champs sont obligatoires.');
    }
    if (credentials.password.length < 6) {
      throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }
    return {
      user: {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: credentials.email.trim().toLowerCase(),
        name: credentials.name.trim(),
      },
      token: 'jwt_mock_token_' + Date.now(),
    };
  }
}

export const authService = new AuthService();
