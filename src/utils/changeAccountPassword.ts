import type { SupabaseClient } from '@supabase/supabase-js';
import { assertStrongPassword } from './passwordPolicy.ts';

type AuthPort = Pick<SupabaseClient['auth'], 'getUser' | 'signInWithPassword' | 'updateUser'>;

export async function changeAccountPassword(auth: AuthPort, expectedUserId: string, currentPassword: string, newPassword: string) {
  assertStrongPassword(newPassword);
  if (!currentPassword) throw new Error('Informe sua senha atual.');
  if (currentPassword === newPassword) throw new Error('Escolha uma senha diferente da atual.');
  const { data, error } = await auth.getUser();
  if (error || !data.user?.email || data.user.id !== expectedUserId) throw new Error('Sua sessão mudou ou expirou. Entre novamente antes de alterar a senha.');
  // Reauthentication verifies old passwords even when the project's optional
  // current-password enforcement is disabled. Never apply the new rules to the old password.
  const verified = await auth.signInWithPassword({ email: data.user.email, password: currentPassword });
  if (verified.error) {
    if (verified.error.code === 'invalid_credentials' || verified.error.message.toLowerCase().includes('invalid login credentials')) throw new Error('Senha atual incorreta.');
    throw new Error(verified.error.message);
  }
  if (verified.data.user?.id !== expectedUserId || verified.data.session?.user.id !== expectedUserId) throw new Error('Não foi possível confirmar sua conta. Entre novamente.');
  const result = await auth.updateUser({ password: newPassword, current_password: currentPassword });
  if (result.error) throw new Error(result.error.message);
}
