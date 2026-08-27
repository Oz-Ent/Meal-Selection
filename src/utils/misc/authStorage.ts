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

  // A refresh token in localStorage means the user opted into a persistent session.
  isPersistent: (): boolean => localStorage.getItem(REFRESH_TOKEN_KEY) !== null,

  setTokens: (
    accessToken: string,
    refreshToken: string,
    persistent = true,
  ): void => {
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setSession: (
    user: IAuthUser,
    accessToken: string,
    refreshToken: string,
    persistent = true,
  ): void => {
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
