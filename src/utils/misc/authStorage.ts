import type { IAuthUser } from '../interfaces/IAuthUser';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const read = (key: string): string | null =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key);

// Single source of truth for the persisted auth session, used by both the
// axios interceptors and the React auth context to avoid duplicated key
// strings and drift between them.
export const authStorage = {
  getToken: (): string | null => read(TOKEN_KEY),
  getRefreshToken: (): string | null => read(REFRESH_TOKEN_KEY),
  getRawUser: (): string | null => read(USER_KEY),

  // Check if session is persisted in localStorage
  isPersistent: (): boolean => localStorage.getItem(TOKEN_KEY) !== null,

  setTokens: (
    accessToken: string,
    _refreshToken?: string,
    persistent = true,
  ): void => {
    const storage = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    other.removeItem(TOKEN_KEY);
    // Ensure HttpOnly cookie security: never store refresh token in Web Storage
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setSession: (
    user: IAuthUser,
    accessToken: string,
    _refreshToken?: string,
    persistent = true,
  ): void => {
    const storage = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
    storage.setItem(TOKEN_KEY, accessToken);
    other.removeItem(USER_KEY);
    other.removeItem(TOKEN_KEY);
    // Ensure HttpOnly cookie security: never store refresh token in Web Storage
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clear: (): void => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(USER_KEY);
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};

export { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY };
