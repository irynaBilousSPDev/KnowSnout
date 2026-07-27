export type CareActionKind = 'water' | 'play' | 'feed';

export type CareDayLog = {
  pet_id: string;
  /** YYYY-MM-DD local day key */
  day: string;
  water_done: boolean;
  water_at: string | null;
  water_note: string | null;
  play_done: boolean;
  play_at: string | null;
  play_minutes: number | null;
  play_note: string | null;
  feed_done: boolean;
  feed_at: string | null;
  feed_note: string | null;
};

export type CareDayInput = {
  water_done?: boolean;
  water_note?: string | null;
  play_done?: boolean;
  play_minutes?: number | null;
  play_note?: string | null;
  feed_done?: boolean;
  feed_note?: string | null;
};

export type CareDayProgress = {
  done: number;
  total: number;
  water: boolean;
  play: boolean;
  feed: boolean;
};
