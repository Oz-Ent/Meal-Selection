import type { IAuthUser } from "./IAuthUser";


export interface IAuthContextType {
  user: IAuthUser | null;
  token: string | null;
  refreshToken: string | null;
login: (user: IAuthUser, token: string, refreshToken: string) => void;
logout: () => void;
}
