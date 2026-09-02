import type { IAuthUser } from "./IAuthUser";


export interface IAuthContextType {
  profile: IAuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isInitializing: boolean;
  login: (profile: IAuthUser, token: string, refreshToken?: string, isPersistent?: boolean) => void;
  logout: () => Promise<void>;
}
