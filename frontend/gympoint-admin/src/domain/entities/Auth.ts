import { UserDetail } from "./User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string | null;
  };
  user: UserDetail;
}
