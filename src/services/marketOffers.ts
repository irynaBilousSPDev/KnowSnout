import { getSettingsPrefs } from '@/src/services/settingsPrefs';
import { getUserProfile } from '@/src/services/userProfile';
import type {
  MarketCountryCode,
  ProductOffer,
  WhereToBuyResult,
} from '@/src/types/marketOffer';

/** Default radius for stationary shops when geolocation is allowed. */
export const STATIONARY_RADIUS_KM = 30;

type OfferQuery = {
  productName: string;
  barcode?: string | null;
};

const MOCK_ONLINE: Record<MarketCountryCode, Omit<ProductOffer, 'id'>[]> = {
  UA: [
    {
      retailerId: 'rozetka',
      retailerName: 'Rozetka',
      channel: 'online',
      country: 'UA',
      priceLabel: '₴1 890',
      currency: 'UAH',
      url: 'https://rozetka.com.ua/search/?text=',
      inStock: true,
      ratingOutOf5: 4.6,
      source: 'mock',
    },
    {
      retailerId: 'allo',
      retailerName: 'Allo',
      channel: 'online',
      country: 'UA',
      priceLabel: '₴1 950',
      currency: 'UAH',
      url: 'https://allo.ua/ua/catalogsearch/result/?q=',
      inStock: true,
      ratingOutOf5: 4.4,
      source: 'mock',
    },
    {
      retailerId: 'masterzoo',
      retailerName: 'MasterZoo',
      channel: 'online',
      country: 'UA',
      priceLabel: '₴1 820',
      currency: 'UAH',
      url: 'https://masterzoo.ua/ua/search/?q=',
      inStock: true,
      ratingOutOf5: 4.5,
      source: 'mock',
    },
  ],
  PL: [
    {
      retailerId: 'allegro',
      retailerName: 'Allegro',
      channel: 'online',
      country: 'PL',
      priceLabel: '79,99 zł',
      currency: 'PLN',
      url: 'https://allegro.pl/listing?string=',
      inStock: true,
      ratingOutOf5: 4.6,
      source: 'mock',
    },
    {
      retailerId: 'zooplus-pl',
      retailerName: 'Zooplus',
      channel: 'online',
      country: 'PL',
      priceLabel: '84,90 zł',
      currency: 'PLN',
      url: 'https://www.zooplus.pl/search/results?q=',
      inStock: true,
      ratingOutOf5: 4.5,
      source: 'mock',
    },
    {
      retailerId: 'kakadu',
      retailerName: 'Kakadu',
      channel: 'online',
      country: 'PL',
      priceLabel: '82,00 zł',
      currency: 'PLN',
      url: 'https://www.kakadu.pl/search?controller=search&s=',
      inStock: null,
      ratingOutOf5: 4.3,
      source: 'mock',
    },
  ],
};

const MOCK_STATIONARY: Record<MarketCountryCode, Omit<ProductOffer, 'id'>[]> = {
  UA: [
    {
      retailerId: 'masterzoo-kyiv',
      retailerName: 'MasterZoo (ТРЦ)',
      channel: 'stationary',
      country: 'UA',
      city: 'Київ',
      distanceKm: 4.2,
      priceLabel: '₴1 890',
      currency: 'UAH',
      url: 'https://masterzoo.ua/',
      inStock: true,
      source: 'mock',
    },
    {
      retailerId: 'zoobazar-kyiv',
      retailerName: 'ZooBazar',
      channel: 'stationary',
      country: 'UA',
      city: 'Київ',
      distanceKm: 8.5,
      priceLabel: null,
      currency: 'UAH',
      url: 'https://maps.google.com/?q=pet+shop+Kyiv',
      inStock: null,
      source: 'mock',
    },
    {
      retailerId: 'petland-lviv',
      retailerName: 'Petland',
      channel: 'stationary',
      country: 'UA',
      city: 'Львів',
      distanceKm: 22,
      priceLabel: '₴1 920',
      currency: 'UAH',
      url: 'https://maps.google.com/?q=pet+shop+Lviv',
      inStock: true,
      source: 'mock',
    },
  ],
  PL: [
    {
      retailerId: 'kakadu-waw',
      retailerName: 'Kakadu',
      channel: 'stationary',
      country: 'PL',
      city: 'Warszawa',
      distanceKm: 3.1,
      priceLabel: '82,00 zł',
      currency: 'PLN',
      url: 'https://www.kakadu.pl/',
      inStock: true,
      source: 'mock',
    },
    {
      retailerId: 'zooplus-point',
      retailerName: 'Zooplus Point',
      channel: 'stationary',
      country: 'PL',
      city: 'Warszawa',
      distanceKm: 12,
      priceLabel: null,
      currency: 'PLN',
      url: 'https://maps.google.com/?q=zooplus+Warszawa',
      inStock: null,
      source: 'mock',
    },
    {
      retailerId: 'maxizoo-krk',
      retailerName: 'Maxi Zoo',
      channel: 'stationary',
      country: 'PL',
      city: 'Kraków',
      distanceKm: 28,
      priceLabel: '85,00 zł',
      currency: 'PLN',
      url: 'https://www.maxizoo.pl/',
      inStock: true,
      source: 'mock',
    },
  ],
};

function encodeQuery(name: string) {
  return encodeURIComponent(name.trim() || 'karma');
}

function withProductUrl(
  offer: Omit<ProductOffer, 'id'>,
  productName: string,
  index: number,
): ProductOffer {
  const q = encodeQuery(productName);
  const needsQuery = offer.url.includes('search') || offer.url.includes('listing') || offer.url.endsWith('=') || offer.url.endsWith('q=') || offer.url.endsWith('text=') || offer.url.endsWith('string=') || offer.url.endsWith('s=');
  return {
    ...offer,
    id: `${offer.country}-${offer.channel}-${offer.retailerId}-${index}`,
    url: needsQuery ? `${offer.url}${q}` : offer.url,
  };
}

/**
 * Resolve market country: Settings override → profile/locale auto → UA fallback.
 * Geolocation for 30 km is stubbed (mock distances); live GPS later.
 */
export async function resolveMarketCountry(): Promise<{
  country: MarketCountryCode;
  source: WhereToBuyResult['countrySource'];
  city: string | null;
}> {
  const prefs = await getSettingsPrefs();
  const profile = await getUserProfile();
  const city =
    (prefs.city?.trim() || profile?.city?.trim() || null) as string | null;

  if (prefs.country === 'UA' || prefs.country === 'PL') {
    return { country: prefs.country, source: 'settings', city };
  }

  // Auto: language hint (pl → PL), else UA
  if (prefs.language === 'pl') {
    return { country: 'PL', source: 'auto', city };
  }
  return { country: 'UA', source: prefs.country === 'auto' ? 'auto' : 'fallback', city };
}

export type WhereToBuyOptions = OfferQuery & {
  /** When true, filter stationary to ≤ STATIONARY_RADIUS_KM (mock distances). */
  geoAllowed?: boolean;
};

/**
 * Mock «Де купити» offers for a scanned product. Live partner/scrape later.
 */
export async function fetchWhereToBuy(
  options: WhereToBuyOptions,
): Promise<WhereToBuyResult> {
  const { country, source, city } = await resolveMarketCountry();
  const name = options.productName.trim() || 'pet food';
  const geoUsed = Boolean(options.geoAllowed);

  const online = MOCK_ONLINE[country].map((o, i) =>
    withProductUrl(o, name, i),
  );

  let stationary = MOCK_STATIONARY[country].map((o, i) =>
    withProductUrl(o, name, i + 100),
  );

  if (city) {
    const cityLower = city.toLowerCase();
    const sameCity = stationary.filter((o) =>
      (o.city ?? '').toLowerCase().includes(cityLower.slice(0, 3)),
    );
    if (sameCity.length > 0) {
      stationary = [
        ...sameCity,
        ...stationary.filter((o) => !sameCity.includes(o)),
      ];
    }
  }

  if (geoUsed) {
    stationary = stationary
      .filter(
        (o) =>
          o.distanceKm == null || o.distanceKm <= STATIONARY_RADIUS_KM,
      )
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  }

  return {
    country,
    countrySource: source,
    city,
    online,
    stationary,
    geoUsed,
    radiusKm: STATIONARY_RADIUS_KM,
  };
}
