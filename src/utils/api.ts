import { getConfig } from './config.js';
import { API_URLS } from '../config/constants.js';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API Error ${status}: ${JSON.stringify(body)}`);
    this.name = 'ApiError';
  }
}

export async function makeRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const config = getConfig();
  const baseUrl = API_URLS[config.environment];
  
  const url = new URL(path, baseUrl);
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-API-KEY', config.apiKey);

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
