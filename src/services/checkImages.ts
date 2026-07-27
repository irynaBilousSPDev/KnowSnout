import { env } from '@/src/lib/env';
import { isNativeSafeImageUri, persistLocalImage } from '@/src/lib/image';
import { supabase } from '@/src/services/supabase';

/**
 * Persist a check photo for journal history.
 * Prefers Supabase storage path (durable); falls back to local file/data URI.
 */
export async function persistCheckPhoto(
  uri: string | null | undefined,
  folder: 'plants' | 'breeds',
): Promise<string | null> {
  if (!uri) return null;

  let stable = uri;
  try {
    stable = await persistLocalImage(uri, folder);
  } catch {
    // Keep original URI if persist fails.
  }

  if (env.isDemoMode || !supabase) return stable;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return stable;

    const ext = stable.toLowerCase().includes('png') ? 'png' : 'jpg';
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
    const response = await fetch(stable);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('scan-images').upload(path, blob, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: false,
    });
    if (error) return stable;
    return path;
  } catch {
    return stable;
  }
}

/** Turn a storage path or local URI into something Image can load. */
export async function resolveCheckImageUrl(
  pathOrUri: string | null | undefined,
): Promise<string | null> {
  if (!pathOrUri) return null;
  if (isNativeSafeImageUri(pathOrUri)) return pathOrUri;
  if (env.isDemoMode || !supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from('scan-images')
      .createSignedUrl(pathOrUri, 60 * 60 * 24);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function resolveCheckImageUrls(
  paths: Array<string | null | undefined>,
): Promise<(string | null)[]> {
  return Promise.all(paths.map((p) => resolveCheckImageUrl(p)));
}
