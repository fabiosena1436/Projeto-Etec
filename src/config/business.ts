export const COMMERCIAL_WHATSAPP = '5518981579318';
export function commercialLink(companyName?: string) {
  const message = companyName
    ? `Olá Fabio! Sou da empresa ${companyName} e gostaria de conhecer o patrocínio no Conecta Sampaio.`
    : 'Olá Fabio! Gostaria de conhecer o patrocínio para minha empresa no Conecta Sampaio.';
  return `https://wa.me/${COMMERCIAL_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
