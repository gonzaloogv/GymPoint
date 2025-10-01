import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { AuthRemote } from './auth.remote';
import { mapUser } from './auth.mapper';


export class AuthRepositoryImpl implements AuthRepository {
async login(email: string, password: string) {
const data = await AuthRemote.login({ email, password });
await SecureStore.setItemAsync('accessToken', data.accessToken);
await SecureStore.setItemAsync('refreshToken', data.refreshToken);
return { user: mapUser(data.user), accessToken: data.accessToken, refreshToken: data.refreshToken };
}
async me() {
const data = await AuthRemote.me();
return mapUser(data.user);
}
async logout() {
await SecureStore.deleteItemAsync('accessToken');
await SecureStore.deleteItemAsync('refreshToken');
}
}