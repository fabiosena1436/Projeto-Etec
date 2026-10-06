import { supabase } from '../../lib/supabase';
import { IMAGE_UPLOAD_LIMIT, IMAGE_TYPES } from '../../utils/prepareImage';

type ImageBucket = 'community-images' | 'promotions' | 'company-logos';
// A failed publication can be retried without uploading the same photo twice.
const uploads = new WeakMap<File, Map<string, Promise<string>>>();

export async function uploadImage(bucket: ImageBucket, ownerId: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Armazenamento indisponível. Tente novamente mais tarde.');
  if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_UPLOAD_LIMIT) throw new Error('Prepare uma foto em JPG, PNG ou WebP de até 1 MB.');
  const key = `${bucket}/${ownerId}`;
  const cached = uploads.get(file)?.get(key);
  if (cached) return cached;
  const operation = (async () => {
    const extension = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
    const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', upsert: false });
    if (error) {
      if (error.message.toLowerCase().includes('bucket not found')) throw new Error('O envio de fotos ainda precisa ser ativado pela administração. Você pode usar um link por enquanto.');
      throw new Error('Não foi possível enviar a foto. Confira sua conexão e tente novamente.');
    }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  })();
  const entries = uploads.get(file) || new Map<string, Promise<string>>();
  entries.set(key, operation); uploads.set(file, entries);
  try { return await operation; }
  catch (error) { entries.delete(key); throw error; }
}
