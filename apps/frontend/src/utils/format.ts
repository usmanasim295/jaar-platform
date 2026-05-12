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
const urduMonths: Record<number, string> = {
  0: 'جنوری',
  1: 'فروری',
  2: 'مارچ',
  3: 'اپریل',
  4: 'مئی',
  5: 'جون',
  6: 'جولائی',
  7: 'اگست',
  8: 'ستمبر',
  9: 'اکتوبر',
  10: 'نومبر',
  11: 'دسمبر',
};

export const formatNumberByLang = (value: number | string, lang: string) => {
  const num = String(value);

  if (lang.startsWith('ar') || lang.startsWith('ur')) {
    return num.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
  }

  return num;
};

export const formatDateByLang = (dateString: string, lang: string) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const isArabic = lang.startsWith('ar');

  if (isArabic) {
    return `${formatNumberByLang(day, lang)} ${urduMonths[month]} ${formatNumberByLang(year, lang)}`;
  }

  

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateBylang = (
  dateString: string,
  lang: string
) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.getMonth();

  // Arabic
  if (lang.startsWith('ar')) {
    return `${formatNumberByLang(day, lang)} ${
      urduMonths[month]
    }`;
  }

  // English
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};