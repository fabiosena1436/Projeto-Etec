export const IMAGE_INPUT_LIMIT = 10 * 1024 * 1024;
export const IMAGE_UPLOAD_LIMIT = 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImage(file: Pick<File, 'size' | 'type'>) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Escolha uma foto em JPG, PNG ou WebP. Se estiver em HEIC, exporte como JPG.');
  if (!file.size || file.size > IMAGE_INPUT_LIMIT) throw new Error('Escolha uma foto de até 10 MB.');
}

// Reencode on the device: reduces downloads and removes embedded photo metadata.
export async function prepareImage(file: File, maxDimension = 1600): Promise<File> {
  validateImage(file);
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('Não foi possível abrir essa foto. Escolha outra imagem em JPG, PNG ou WebP.'); }
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Seu navegador não conseguiu preparar a foto. Tente um navegador atualizado.');
    let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 5; attempt++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.82 - attempt * 0.1));
      if (!blob) throw new Error('Não foi possível preparar essa foto. Tente outra imagem.');
      if (blob.size <= 512 * 1024 || (attempt === 4 && blob.size <= IMAGE_UPLOAD_LIMIT)) {
        return new File([blob], blob.type === 'image/webp' ? 'foto.webp' : 'foto.png', { type: blob.type });
      }
      scale *= 0.8;
    }
    throw new Error('A foto continua muito grande. Escolha uma imagem menor.');
  } finally { bitmap.close(); }
}
