export type Role = 'USER' | 'ADMIN' | 'PREMIUM';
export interface User { id_user: number; name: string; email: string; role: Role }