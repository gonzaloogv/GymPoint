import { LoginResponseDTO } from './auth.dto';
import { User } from '../domain/entities/User';

export const mapUser = (u: LoginResponseDTO['user']): User => {
  // Determinar el rol principal (tomar el primero o USER por defecto)
  const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0] : 'USER';
  const role = primaryRole === 'ADMIN' ? 'ADMIN' : primaryRole === 'PREMIUM' ? 'PREMIUM' : 'USER';

  return {
    id_user: u.id_user_profile || u.id_admin_profile || u.id,
    name: u.name || '',
    email: u.email,
    role: role as 'USER' | 'ADMIN' | 'PREMIUM',
    tokens: u.tokens || 0,
    plan: u.subscription === 'PREMIUM' ? 'Premium' : 'Free',
  };
};
