import { LoginResponseDTO } from './auth.dto';
import { User } from '../domain/entities/User';
export const mapUser = (u: LoginResponseDTO['user']): User => ({
  id_user: u.id_user,
  name: u.name,
  email: u.email,
  role: u.role,
});
