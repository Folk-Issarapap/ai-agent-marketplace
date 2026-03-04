'use client';

/**
 * Stub: authorization not implemented in marketplace.
 * Returns true so transaction row actions (e.g. View) are shown.
 */
export function useCan(
  _action: string,
  _resource: string,
  _resourceData?: unknown
): boolean {
  return true;
}
