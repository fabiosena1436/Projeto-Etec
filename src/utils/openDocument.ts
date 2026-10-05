/** Open synchronously from a click, before waiting for the private file URL. */
export async function openDocument(getUrl: () => Promise<string | null>): Promise<void> {
  const preview = window.open('', '_blank');
  if (!preview) throw new Error('Permita abrir uma nova aba para visualizar o currículo.');
  preview.opener = null;
  try {
    const url = await getUrl();
    if (!url || !/^https?:\/\//i.test(url)) throw new Error('Currículo indisponível ou acesso não autorizado.');
    preview.location.replace(url);
  } catch (error) {
    preview.close();
    throw error;
  }
}
