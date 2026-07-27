export type StoreScoreSource = 'mock' | 'allegro';

export type StoreScore = {
  store: 'allegro';
  /** Average rating out of 5, when known */
  scoreOutOf5: number | null;
  reviewCount: number | null;
  /** Outbound listing / offer URL */
  url: string;
  label: string;
  source: StoreScoreSource;
};
