export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_POLICY_MESSAGE = 'Use pelo menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.';
// Mesmo conjunto de símbolos aceito pela política de senha do Supabase Auth.
const symbols = '!@#$%^&*()_+-=[]{};\'\\:"|<>?,./`~';

export function passwordRequirements(password: string) {
  return [
    { label: 'Pelo menos 8 caracteres', met: Array.from(password).length >= PASSWORD_MIN_LENGTH },
    { label: 'Uma letra maiúscula (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula (a–z)', met: /[a-z]/.test(password) },
    { label: 'Um número (0–9)', met: /[0-9]/.test(password) },
    { label: 'Um símbolo, como !, @ ou #', met: Array.from(password).some(char => symbols.includes(char)) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return passwordRequirements(password).every(requirement => requirement.met);
}

export function assertStrongPassword(password: string): void {
  if (!isStrongPassword(password)) throw new Error(PASSWORD_POLICY_MESSAGE);
}
