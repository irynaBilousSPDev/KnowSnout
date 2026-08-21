import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { isUuid } from '@/src/lib/uuid';
import { supabase } from '@/src/services/supabase';

const REVIEWS_KEY = 'knowsnout.directory_reviews.v1';
const REPORTS_KEY = 'knowsnout.directory_fraud_reports.v1';

/** Reviews/reports: cloud when place id is UUID + user signed in. */

export type DirectoryReview = {
  id: string;
  placeId: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type DirectoryFraudReport = {
  id: string;
  placeId: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'queued' | 'reviewing' | 'resolved' | 'dismissed';
};

async function readReviews(): Promise<DirectoryReview[]> {
  try {
    const raw = await AsyncStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DirectoryReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readReports(): Promise<DirectoryFraudReport[]> {
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DirectoryFraudReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listReviewsForPlace(
  placeId: string,
): Promise<DirectoryReview[]> {
  const local = (await readReviews()).filter((r) => r.placeId === placeId);
  const user = await getCloudUser();
  if (!user || !supabase || !isUuid(placeId)) return local;

  try {
    const { data, error } = await supabase
      .from('directory_reviews')
      .select('id, place_id, rating, body, created_at')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });
    if (error || !data?.length) return local;
    const cloud = data.map((row) => ({
      id: String(row.id),
      placeId: String(row.place_id),
      rating: Number(row.rating),
      text: String(row.body),
      createdAt: String(row.created_at),
    }));
    const byId = new Map<string, DirectoryReview>();
    for (const r of [...local, ...cloud]) byId.set(r.id, r);
    return [...byId.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  } catch {
    return local;
  }
}

export async function saveDirectoryReview(input: {
  placeId: string;
  rating: number;
  text: string;
}): Promise<DirectoryReview> {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const text = input.text.trim();
  const user = await getCloudUser();

  if (user && supabase && isUuid(input.placeId)) {
    try {
      const { data, error } = await supabase
        .from('directory_reviews')
        .insert({
          place_id: input.placeId,
          user_id: user.id,
          rating,
          body: text,
        })
        .select('id, place_id, rating, body, created_at')
        .single();
      if (!error && data) {
        return {
          id: String(data.id),
          placeId: String(data.place_id),
          rating: Number(data.rating),
          text: String(data.body),
          createdAt: String(data.created_at),
        };
      }
      if (error && !isMissingSchemaError(error.message)) {
        /* local */
      }
    } catch {
      /* local */
    }
  }

  const review: DirectoryReview = {
    id: `rev-${Date.now()}`,
    placeId: input.placeId,
    rating,
    text,
    createdAt: new Date().toISOString(),
  };
  const prev = await readReviews();
  await AsyncStorage.setItem(
    REVIEWS_KEY,
    JSON.stringify([review, ...prev].slice(0, 200)),
  );
  return review;
}

export async function queueFraudReport(input: {
  placeId: string;
  reason: string;
  details: string;
}): Promise<DirectoryFraudReport> {
  const reason = input.reason.trim();
  const details = input.details.trim();
  const user = await getCloudUser();

  if (user && supabase && isUuid(input.placeId)) {
    try {
      const { data, error } = await supabase
        .from('directory_fraud_reports')
        .insert({
          place_id: input.placeId,
          user_id: user.id,
          reason,
          details,
          status: 'queued',
        })
        .select('id, place_id, reason, details, status, created_at')
        .single();
      if (!error && data) {
        return {
          id: String(data.id),
          placeId: String(data.place_id),
          reason: String(data.reason),
          details: String(data.details ?? ''),
          createdAt: String(data.created_at),
          status: (data.status as DirectoryFraudReport['status']) || 'queued',
        };
      }
    } catch {
      /* local */
    }
  }

  const report: DirectoryFraudReport = {
    id: `fraud-${Date.now()}`,
    placeId: input.placeId,
    reason,
    details,
    createdAt: new Date().toISOString(),
    status: 'queued',
  };
  const prev = await readReports();
  await AsyncStorage.setItem(
    REPORTS_KEY,
    JSON.stringify([report, ...prev].slice(0, 100)),
  );
  return report;
}

export async function listFraudReports(): Promise<DirectoryFraudReport[]> {
  const local = await readReports();
  const user = await getCloudUser();
  if (!user || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('directory_fraud_reports')
      .select('id, place_id, reason, details, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error || !data?.length) return local;
    const cloud = data.map((row) => ({
      id: String(row.id),
      placeId: String(row.place_id),
      reason: String(row.reason),
      details: String(row.details ?? ''),
      createdAt: String(row.created_at),
      status: (row.status as DirectoryFraudReport['status']) || 'queued',
    }));
    const byId = new Map<string, DirectoryFraudReport>();
    for (const r of [...local, ...cloud]) byId.set(r.id, r);
    return [...byId.values()];
  } catch {
    return local;
  }
}
