import { ENV } from '@/config';

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Robust, typed HTTP client wrapper with abort timeout.
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeoutMs = 10000, headers, ...rest } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${ENV.apiUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new ApiError(`API request failed: ${response.statusText}`, response.status, errorBody);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    const msg = error instanceof Error ? error.message : 'Unknown network failure';
    throw new ApiError(msg, 0);
  }
}
