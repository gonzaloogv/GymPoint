import * as SecureStore from 'expo-secure-store';
import { AuthRepository, RegisterParams } from '../domain/repositories/AuthRepository';
import { AuthRemote } from './auth.remote';
import { mapUser } from './auth.mapper';

export class AuthRepositoryImpl implements AuthRepository {
  async login(email: string, password: string) {
    const data = await AuthRemote.login({ email, password });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    return {
      user: mapUser(data.user),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }
  async me() {
    const data = await AuthRemote.me();
    // data ya es el perfil del usuario directamente, no envuelto en { user }
    return {
      id_user: data.id_user,
      name: data.name,
      email: data.email,
      role: data.role as 'USER' | 'ADMIN' | 'PREMIUM',
      tokens: data.tokens,
      plan: 'Free', // TODO: Mapear desde subscription cuando esté disponible
    };
  }
  async logout() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
  async register(params: RegisterParams) {
    const data = await AuthRemote.register(params);
    return data;
  }
}
