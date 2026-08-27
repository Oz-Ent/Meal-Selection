import { authStorage, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './authStorage';
import type { IAuthUser } from '../interfaces/IAuthUser';

const user: IAuthUser = {
  user: { id: 1, email: 'a@b.com', name: 'Test User', roleId: 1, roleName: 'Admin' },
  availability: { startDate: '2025-01-01', endDate: '2025-12-31' },
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('authStorage', () => {
  it('reads token/refreshToken/user from localStorage first', () => {
    localStorage.setItem(TOKEN_KEY, 'lt');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'lr');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    expect(authStorage.getToken()).toBe('lt');
    expect(authStorage.getRefreshToken()).toBe('lr');
    expect(authStorage.getRawUser()).toBe(JSON.stringify(user));
  });

  it('falls back to sessionStorage when localStorage is empty', () => {
    sessionStorage.setItem(TOKEN_KEY, 'st');
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'sr');
    expect(authStorage.getToken()).toBe('st');
    expect(authStorage.getRefreshToken()).toBe('sr');
    expect(authStorage.getRawUser()).toBeNull();
  });

  it('isPersistent is true only when a refresh token is in localStorage', () => {
    expect(authStorage.isPersistent()).toBe(false);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'sr');
    expect(authStorage.isPersistent()).toBe(false);
    localStorage.setItem(REFRESH_TOKEN_KEY, 'lr');
    expect(authStorage.isPersistent()).toBe(true);
  });

  it('setTokens persists to localStorage when persistent', () => {
    authStorage.setTokens('at', 'rt', true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('at');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('rt');
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('setTokens persists to sessionStorage when not persistent', () => {
    authStorage.setTokens('at', 'rt', false);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('at');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('setSession writes user, token and refreshToken', () => {
    authStorage.setSession(user, 'at', 'rt', true);
    expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(user));
    expect(localStorage.getItem(TOKEN_KEY)).toBe('at');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('rt');
  });

  it('setSession defaults to localStorage when persistence is omitted', () => {
    authStorage.setSession(user, 'at', 'rt');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('at');
  });

  it('clear removes all keys from both storages', () => {
    authStorage.setSession(user, 'at', 'rt', true);
    sessionStorage.setItem(TOKEN_KEY, 'st');
    authStorage.clear();
    for (const key of [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]) {
      expect(localStorage.getItem(key)).toBeNull();
      expect(sessionStorage.getItem(key)).toBeNull();
    }
  });
});
