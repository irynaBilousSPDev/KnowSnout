import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';

const LOCAL_KEY = 'knowsnout.quiz_sessions.v1';

export type QuizCategory =
  | 'breed'
  | 'breed_origin'
  | 'animal_group'
  | 'animals_trivia';

export type QuizSessionRow = {
  id: string;
  user_id: string;
  category: QuizCategory;
  species: 'dog' | 'cat' | null;
  score: number;
  total: number;
  percent: number;
  created_at: string;
};

export type QuizStats = {
  games: number;
  averagePercent: number;
  bestPercent: number;
  byCategory: Record<
    QuizCategory,
    { games: number; averagePercent: number; bestPercent: number }
  >;
};

function emptyCategoryStats() {
  return { games: 0, averagePercent: 0, bestPercent: 0 };
}

export function emptyQuizStats(): QuizStats {
  return {
    games: 0,
    averagePercent: 0,
    bestPercent: 0,
    byCategory: {
      breed: emptyCategoryStats(),
      breed_origin: emptyCategoryStats(),
      animal_group: emptyCategoryStats(),
      animals_trivia: emptyCategoryStats(),
    },
  };
}

function mapRow(row: Record<string, unknown>): QuizSessionRow {
  const category = String(row.category);
  const speciesRaw = row.species ? String(row.species) : null;
  const normalized: QuizCategory =
    category === 'breed_origin' ||
    category === 'animal_group' ||
    category === 'animals_trivia'
      ? category
      : 'breed';
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    category: normalized,
    species: speciesRaw === 'dog' || speciesRaw === 'cat' ? speciesRaw : null,
    score: Number(row.score),
    total: Number(row.total),
    percent: Number(row.percent),
    created_at: String(row.created_at),
  };
}

async function readLocal(): Promise<QuizSessionRow[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuizSessionRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(rows: QuizSessionRow[]) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(0, 200)));
}

export function computeQuizStats(sessions: QuizSessionRow[]): QuizStats {
  const stats = emptyQuizStats();
  if (sessions.length === 0) return stats;

  let sum = 0;
  let best = 0;
  const catSums: Record<QuizCategory, number> = {
    breed: 0,
    breed_origin: 0,
    animal_group: 0,
    animals_trivia: 0,
  };
  const catBest: Record<QuizCategory, number> = {
    breed: 0,
    breed_origin: 0,
    animal_group: 0,
    animals_trivia: 0,
  };

  for (const s of sessions) {
    sum += s.percent;
    best = Math.max(best, s.percent);
    catSums[s.category] += s.percent;
    catBest[s.category] = Math.max(catBest[s.category], s.percent);
    stats.byCategory[s.category].games += 1;
  }

  stats.games = sessions.length;
  stats.averagePercent = Math.round((sum / sessions.length) * 10) / 10;
  stats.bestPercent = Math.round(best * 10) / 10;

  (Object.keys(stats.byCategory) as QuizCategory[]).forEach((key) => {
    const games = stats.byCategory[key].games;
    if (games === 0) return;
    stats.byCategory[key].averagePercent =
      Math.round((catSums[key] / games) * 10) / 10;
    stats.byCategory[key].bestPercent = Math.round(catBest[key] * 10) / 10;
  });

  return stats;
}

export async function listQuizSessions(limit = 50): Promise<QuizSessionRow[]> {
  const local = await readLocal();

  if (env.isDemoMode || !supabase) {
    return local
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return local.slice(0, limit);
    const cloud = data.map((row) => mapRow(row as Record<string, unknown>));
    // Merge local-only rows (not yet synced / offline)
    const cloudIds = new Set(cloud.map((c) => c.id));
    const merged = [
      ...cloud,
      ...local.filter((l) => !cloudIds.has(l.id)),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return merged.slice(0, limit);
  } catch {
    return local.slice(0, limit);
  }
}

export async function getQuizStats(): Promise<QuizStats> {
  const sessions = await listQuizSessions(200);
  return computeQuizStats(sessions);
}

export async function saveQuizSession(input: {
  category: QuizCategory;
  score: number;
  total: number;
  species?: 'dog' | 'cat' | null;
}): Promise<QuizSessionRow> {
  const total = Math.max(1, input.total);
  const score = Math.max(0, Math.min(input.score, total));
  const percent = Math.round((score / total) * 1000) / 10;
  const user = await getCurrentUser();
  const userId = user?.id ?? 'local';

  const localRow: QuizSessionRow = {
    id: `local-quiz-${Date.now()}`,
    user_id: userId,
    category: input.category,
    species: input.species ?? null,
    score,
    total,
    percent,
    created_at: new Date().toISOString(),
  };

  const prev = await readLocal();
  await writeLocal([localRow, ...prev]);

  if (env.isDemoMode || !supabase || !user) {
    return localRow;
  }

  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        category: input.category,
        species: input.species ?? null,
        score,
        total,
        percent,
      })
      .select('*')
      .single();

    if (error || !data) return localRow;

    const cloud = mapRow(data as Record<string, unknown>);
    // Replace local placeholder with cloud id
    const next = [cloud, ...prev.filter((p) => p.id !== localRow.id)];
    await writeLocal(next);
    return cloud;
  } catch {
    return localRow;
  }
}

export async function deleteQuizSession(id: string): Promise<void> {
  const prev = await readLocal();
  await writeLocal(prev.filter((p) => p.id !== id));

  if (env.isDemoMode || !supabase || id.startsWith('local-')) return;

  try {
    await supabase.from('quiz_sessions').delete().eq('id', id);
  } catch {
    // Local already updated.
  }
}
