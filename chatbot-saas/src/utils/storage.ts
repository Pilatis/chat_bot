/**
 * Utilitário para acesso seguro a localStorage e sessionStorage.
 * No servidor (SSR) ou em ambientes sem window, as operações são no-op ou retornam null,
 * evitando erros de "localStorage/sessionStorage is not defined".
 */

const isBrowser = (): boolean => typeof window !== 'undefined';

export function getLocalItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded ou storage desabilitado
  }
}

export function removeLocalItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getSessionItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSessionItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // quota exceeded ou storage desabilitado
  }
}

export function removeSessionItem(key: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export { isBrowser };
