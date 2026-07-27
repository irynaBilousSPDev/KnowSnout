import { t } from '@/src/i18n';

/** Supabase PostgREST when a column/table is not in the schema cache yet. */
export function isMissingSchemaError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes('schema cache') ||
    m.includes('could not find the') ||
    m.includes('does not exist')
  );
}

export function friendlyDbError(message: string | null | undefined): string {
  if (!message) return t('common.error');
  const m = message.toLowerCase();
  if (
    m.includes('favorite_product_id') ||
    m.includes('feeding_logs') ||
    (isMissingSchemaError(message) &&
      (m.includes('pets') || m.includes('feeding')))
  ) {
    return t('errors.needMigrationFavorite');
  }
  return message;
}

/** Drop fields that older DBs may not have yet (retry after failed insert/update). */
export function stripOptionalPetColumns<T extends Record<string, unknown>>(
  row: T,
): T {
  const next = { ...row };
  delete next.favorite_product_id;
  delete next.life_stage;
  return next;
}
