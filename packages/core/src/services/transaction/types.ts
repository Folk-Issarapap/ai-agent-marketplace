/**
 * Minimal transaction types for marketplace UI.
 * Replace with real schema when transaction feature is implemented.
 */
export interface TransactionWithRelations {
  id: string;
  amount?: string | null;
  currency?: string | null;
  status?: string | null;
  direction?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt?: string | Date | null;
  processedAt?: string | Date | null;
  integrationId?: string | null;
  customerId?: string | null;
  providerId?: string | null;
  metadata?: Record<string, unknown> | null;
  integration?: { id: string; name: string } | null;
  customer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    businessName?: string | null;
  } | null;
}
