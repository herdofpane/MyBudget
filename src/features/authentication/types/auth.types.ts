export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
}

export interface AuthResponse {
  readonly user: AuthUser;
  readonly token: string;
}
