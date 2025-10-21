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
    return mapUser({
      id: data.id,
      id_user_profile: data.id_user_profile,
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      subscription: data.subscription,
      tokens: data.tokens,
      roles: data.subscription === 'PREMIUM' ? ['PREMIUM'] : ['USER'],
    });
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
