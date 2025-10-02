import { ReactNode } from 'react';
import { useAuthStore } from '@features/auth/state/auth.store';
import { Text } from 'react-native';

export function RoleGate({
  roles,
  children,
}: {
  roles: Array<'USER' | 'PREMIUM' | 'ADMIN'>;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Text>No autenticado</Text>;
  if (!roles.includes(user.role)) return <Text>No autorizado</Text>;
  return children;
}
