import { Platform } from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { API_BASE_URL } from './config';

async function getToken() {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userToken');
    }
    return await getItemAsync('userToken');
  } catch (error) {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();

  const controller = new AbortController();
  const shouldApplyTimeout = !init?.signal;
  const timeoutId = shouldApplyTimeout ? setTimeout(() => controller.abort(), 15000) : null;
  const signal = init?.signal ?? controller.signal;

  let response: Response;
  try {
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
    } catch (error) {
      const err = error as { name?: string; message?: string };
      if (err?.name === 'AbortError') {
        throw new Error('Koneksi timeout. Coba lagi.');
      }
      throw new Error('Tidak dapat terhubung ke server. Periksa internet atau coba lagi nanti.');
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = { message: text };
    }
    if ([502, 503, 504].includes(response.status)) {
      throw new Error(`Server sedang bermasalah (${response.status}). Coba beberapa menit lagi.`);
    }
    throw new Error(errorData.message || `API error ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...init,
    }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...init,
    }),
  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...init,
    }),
};
