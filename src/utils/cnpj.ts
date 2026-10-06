/** Receita Federal: módulo 11, inclusive o formato alfanumérico de 2026. */
export function normalizeCnpj(value?: string | null): string | null {
  const raw = (value || '').trim().toUpperCase();
  if (/^[A-Z0-9]{12}[0-9]{2}$/.test(raw)) return raw;
  if (/^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$/.test(raw)) {
    return raw.replace(/[./-]/g, '');
  }
  return null;
}

export function isValidCnpj(value?: string | null): boolean {
  const cnpj = normalizeCnpj(value);
  if (!cnpj || /^(\d)\1{13}$/.test(cnpj)) return false;
  function digit(base: string) {
    let sum = 0;
    for (let i = base.length - 1, weight = 2; i >= 0; i--, weight = weight === 9 ? 2 : weight + 1) {
      sum += (base.charCodeAt(i) - 48) * weight;
    }
    const remainder = sum % 11;
    return remainder < 2 ? '0' : String(11 - remainder);
  }
  const first = digit(cnpj.slice(0, 12));
  return cnpj.slice(12) === first + digit(cnpj.slice(0, 12) + first);
}
