/**
 * Minimal integration type for marketplace UI (e.g. transaction filters).
 * Replace with real schema when integration feature is implemented.
 */
export interface Integration {
  id: string;
  name: string;
  status?: string;
}

/**
 * Minimal customer type for marketplace UI (e.g. transaction details).
 * Replace with real schema when customer feature is implemented.
 */
export interface Customer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
}
