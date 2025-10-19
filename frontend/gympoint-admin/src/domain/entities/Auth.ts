import { UserDetail } from "./User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserDetail;
}
