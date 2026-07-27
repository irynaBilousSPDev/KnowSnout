import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export async function uriToBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    const parts = uri.split(',');
    return parts[1] ?? '';
  }
  if (uri.startsWith('blob:') && Platform.OS !== 'web') {
    const dataUri = await uriToDataUri(uri);
    return dataUri.split(',')[1] ?? '';
  }
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.startsWith('data:image/png')) return 'image/png';
  if (lower.startsWith('data:image/webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

/** True when RN Image / networking can load this URI on the current platform. */
export function isNativeSafeImageUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  if (uri.startsWith('blob:')) return Platform.OS === 'web';
  return (
    uri.startsWith('file:') ||
    uri.startsWith('data:') ||
    uri.startsWith('http:') ||
    uri.startsWith('https:') ||
    uri.startsWith('content:') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library:') ||
    uri.startsWith('/')
  );
}

function guessExtension(uri: string): string {
  const clean = uri.split('?')[0]?.toLowerCase() ?? '';
  if (clean.endsWith('.png') || uri.startsWith('data:image/png')) return 'png';
  if (clean.endsWith('.webp') || uri.startsWith('data:image/webp')) return 'webp';
  if (clean.endsWith('.heic')) return 'heic';
  return 'jpg';
}

async function ensureMediaDir(docs: string): Promise<string> {
  const dir = `${docs}knowsnout-media/`;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  } catch {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(slice) as number[]);
  }
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary);
  }
  throw new Error('IMAGE_PERSIST_FAILED');
}

/** Expo web / editing flows often return blob: URLs — convert to data URI. */
async function uriToDataUri(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const response = await fetch(uri);
  const blob = await response.blob();
  const mime = blob.type || 'image/jpeg';

  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string' && result.startsWith('data:')) {
          resolve(result);
        } else {
          reject(new Error('Failed to read image data'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image data'));
      reader.readAsDataURL(blob);
    });
  }

  const buffer = await blob.arrayBuffer();
  const base64 = bytesToBase64(new Uint8Array(buffer));
  return `data:${mime};base64,${base64}`;
}

async function writeDataUriToDocuments(
  dataUri: string,
  prefix: string,
  docs: string,
): Promise<string | null> {
  try {
    const match = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUri);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const dir = await ensureMediaDir(docs);
    const dest = `${dir}${prefix}-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return dest;
  } catch {
    return null;
  }
}

async function writeBase64ToDocuments(
  base64: string,
  prefix: string,
  mimeType?: string | null,
): Promise<string | null> {
  const docs = FileSystem.documentDirectory;
  if (!docs) return null;
  const mime = mimeType || 'image/jpeg';
  const dataUri = `data:${mime};base64,${base64}`;
  return writeDataUriToDocuments(dataUri, prefix, docs);
}

/**
 * Prefer base64 from ImagePicker (avoids blob: crashes after allowsEditing).
 * Falls back to URI persistence.
 */
export async function persistPickerAsset(
  asset: {
    uri: string;
    base64?: string | null;
    mimeType?: string | null;
  },
  prefix = 'img',
): Promise<string> {
  if (asset.base64) {
    const fileUri = await writeBase64ToDocuments(
      asset.base64,
      prefix,
      asset.mimeType,
    );
    if (fileUri) return fileUri;
    if (Platform.OS === 'web') {
      return `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
    }
  }
  return persistLocalImage(asset.uri, prefix);
}

/**
 * ImagePicker may return cache, ph://, or blob: URLs that disappear / break native FS.
 * Normalize to a durable file:// (native) or data: URI (web).
 * Never returns blob: on native.
 */
export async function persistLocalImage(
  uri: string,
  prefix = 'img',
): Promise<string> {
  if (!uri) return uri;
  if (uri.startsWith('data:')) {
    const docs = FileSystem.documentDirectory;
    if (docs && Platform.OS !== 'web') {
      const fileUri = await writeDataUriToDocuments(uri, prefix, docs);
      if (fileUri) return fileUri;
    }
    return uri;
  }

  const docs = FileSystem.documentDirectory;
  if (docs && uri.startsWith(docs)) return uri;

  const isBlobOrHttp =
    uri.startsWith('blob:') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://');

  if (isBlobOrHttp || Platform.OS === 'web') {
    try {
      const dataUri = await uriToDataUri(uri);
      if (docs && Platform.OS !== 'web') {
        const fileUri = await writeDataUriToDocuments(dataUri, prefix, docs);
        if (fileUri) return fileUri;
      }
      if (Platform.OS === 'web') return dataUri;
      // Native must not keep blob:/http temp as display URI when write failed
      if (docs) {
        const fileUri = await writeDataUriToDocuments(dataUri, prefix, docs);
        if (fileUri) return fileUri;
      }
      throw new Error('IMAGE_PERSIST_FAILED');
    } catch (err) {
      if (uri.startsWith('blob:') && Platform.OS !== 'web') {
        throw new Error(
          err instanceof Error ? err.message : 'IMAGE_PERSIST_FAILED',
        );
      }
      if (Platform.OS === 'web') {
        try {
          return await uriToDataUri(uri);
        } catch {
          return uri;
        }
      }
      throw err instanceof Error ? err : new Error('IMAGE_PERSIST_FAILED');
    }
  }

  if (!docs) {
    try {
      return await uriToDataUri(uri);
    } catch {
      return uri;
    }
  }

  try {
    const dir = await ensureMediaDir(docs);
    const dest = `${dir}${prefix}-${Date.now()}.${guessExtension(uri)}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    try {
      const dataUri = await uriToDataUri(uri);
      const fileUri = await writeDataUriToDocuments(dataUri, prefix, docs);
      if (fileUri) return fileUri;
      throw new Error('IMAGE_PERSIST_FAILED');
    } catch {
      throw new Error('IMAGE_PERSIST_FAILED');
    }
  }
}
