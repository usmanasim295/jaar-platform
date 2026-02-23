/**
 * Normalize phone number for display: always show with + at the start
 * (e.g. "966123456789+" or "966123456789" → "+966123456789").
 * Keeps display consistent in both LTR and RTL (Arabic) views.
 */
export function formatPhoneForDisplay(
  phone: string | null | undefined
): string {
  if (phone == null || String(phone).trim() === '') return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 0) return '—';
  return '+' + digits;
}
