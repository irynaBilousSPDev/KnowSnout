import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { resolveSpecies } from '@/src/lib/species';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type { AnalysisResult, PetSpecies, ScanRow } from '@/src/types/scan';

const LOCAL_SCANS_KEY = 'snoutscore.demo.scans';

async function readLocalScans(): Promise<ScanRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_SCANS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScanRow[];
  } catch {
    return [];
  }
}

async function writeLocalScans(scans: ScanRow[]) {
  await AsyncStorage.setItem(LOCAL_SCANS_KEY, JSON.stringify(scans));
}

function mapRow(row: Record<string, unknown>): ScanRow {
  const productName = String(row.product_name);
  const summary = String(row.summary ?? '');
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    product_name: productName,
    score: Number(row.score),
    pros: Array.isArray(row.pros) ? row.pros.map(String) : [],
    cons: Array.isArray(row.cons) ? row.cons.map(String) : [],
    summary,
    image_path: row.image_path ? String(row.image_path) : null,
    barcode: row.barcode ? String(row.barcode) : null,
    product_id: row.product_id ? String(row.product_id) : null,
    species: resolveSpecies(row.species, productName, summary),
    created_at: String(row.created_at),
  };
}

/** Persist inferred dog/cat when older rows were saved without species. */
function queueSpeciesBackfill(
  rawRows: Record<string, unknown>[],
  mapped: ScanRow[],
) {
  void (async () => {
    try {
      if (env.isDemoMode || !supabase) {
        const local = await readLocalScans();
        let changed = false;
        const next = local.map((scan) => {
          const resolved = resolveSpecies(
            scan.species,
            scan.product_name,
            scan.summary,
          );
          if (resolved === 'unknown' || scan.species === resolved) return scan;
          changed = true;
          return { ...scan, species: resolved };
        });
        if (changed) await writeLocalScans(next);
        return;
      }

      await Promise.all(
        rawRows.map(async (raw, index) => {
          const client = supabase;
          if (!client) return;
          const stored = raw.species;
          if (stored === 'dog' || stored === 'cat') return;
          const inferred = mapped[index]?.species;
          if (inferred !== 'dog' && inferred !== 'cat') return;
          await client
            .from('scans')
            .update({ species: inferred })
            .eq('id', mapped[index].id);
        }),
      );
    } catch (err) {
      console.warn('Species backfill failed', err);
    }
  })();
}

export async function listScans(): Promise<ScanRow[]> {
  if (env.isDemoMode || !supabase) {
    const raw = await readLocalScans();
    const scans = raw.map((row) =>
      mapRow(row as unknown as Record<string, unknown>),
    );
    queueSpeciesBackfill(
      raw.map((row) => row as unknown as Record<string, unknown>),
      scans,
    );
    return scans.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const rawRows = (data ?? []) as Record<string, unknown>[];
  const scans = rawRows.map(mapRow);
  queueSpeciesBackfill(rawRows, scans);
  return scans;
}

export async function getScan(id: string): Promise<ScanRow | null> {
  if (env.isDemoMode || !supabase) {
    const scans = await listScans();
    return scans.find((s) => s.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function saveScan(
  result: AnalysisResult,
  imageUri?: string | null,
  options?: {
    barcode?: string | null;
    productId?: string | null;
    species?: PetSpecies | null;
  },
): Promise<ScanRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in to save a scan');

  const species = resolveSpecies(
    options?.species,
    result.productName,
    result.summary,
  );

  let imagePath: string | null = null;

  if (env.isDemoMode || !supabase) {
    const scan: ScanRow = {
      id: `local-${Date.now()}`,
      user_id: user.id,
      product_name: result.productName,
      score: result.score,
      pros: result.pros,
      cons: result.cons,
      summary: result.summary,
      image_path: imageUri ?? null,
      barcode: options?.barcode ?? null,
      product_id: options?.productId ?? null,
      species,
      created_at: new Date().toISOString(),
    };
    const scans = await readLocalScans();
    scans.unshift(scan);
    await writeLocalScans(scans);
    return scan;
  }

  if (imageUri) {
    const ext = imageUri.toLowerCase().includes('png') ? 'png' : 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(path, blob, {
          contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          upsert: false,
        });
      if (uploadError) {
        console.warn('Image upload failed:', uploadError.message);
      } else {
        imagePath = path;
      }
    } catch (uploadErr) {
      console.warn('Image upload failed:', uploadErr);
    }
  }

  const { data, error } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      product_name: result.productName,
      score: result.score,
      pros: result.pros,
      cons: result.cons,
      summary: result.summary,
      image_path: imagePath,
      barcode: options?.barcode ?? null,
      product_id: options?.productId ?? null,
      species,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to save scan');
  }

  return mapRow(data as Record<string, unknown>);
}

export async function deleteScan(id: string): Promise<void> {
  if (env.isDemoMode || !supabase) {
    const scans = await readLocalScans();
    await writeLocalScans(scans.filter((s) => s.id !== id));
    return;
  }

  const { error } = await supabase.from('scans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
