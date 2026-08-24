/** Market / «Де купити» types — P1e mock-first. */

export type MarketCountryCode = 'UA' | 'PL';

/** User preference: explicit country or auto-detect. */
export type MarketCountryPref = 'auto' | MarketCountryCode;

export type OfferChannel = 'online' | 'stationary';

export type ProductOffer = {
  id: string;
  retailerId: string;
  retailerName: string;
  channel: OfferChannel;
  country: MarketCountryCode;
  /** City for stationary; optional for online */
  city?: string | null;
  /** Approx km from user when geo mock applied */
  distanceKm?: number | null;
  priceLabel?: string | null;
  currency?: 'UAH' | 'PLN' | null;
  /** Outbound product or search URL */
  url: string;
  inStock?: boolean | null;
  /** Marketplace rating out of 5 when known */
  ratingOutOf5?: number | null;
  source: 'mock' | 'partner' | 'scrape';
};

export type WhereToBuyResult = {
  country: MarketCountryCode;
  countrySource: 'settings' | 'auto' | 'fallback';
  city: string | null;
  online: ProductOffer[];
  stationary: ProductOffer[];
  geoUsed: boolean;
  radiusKm: number;
};
