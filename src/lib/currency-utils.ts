export type SupportedCurrency = 'USD' | 'VND'

const USD_TO_VND = 26_150

const LOCALE_MAP: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  VND: 'vi-VN',
}

/**
 * Format an amount in the given currency using the appropriate locale.
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'VND',
  options?: { compact?: boolean }
): string {
  const locale = LOCALE_MAP[currency] || 'vi-VN'
  const fractionDigits = currency === 'VND' ? 0 : 2

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    notation: options?.compact ? 'compact' : 'standard',
    compactDisplay: options?.compact ? 'short' : undefined,
  }).format(amount)
}

/**
 * Convert an amount between USD and VND.
 * Returns the amount unchanged if source and target are the same.
 */
export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'VND') return amount * USD_TO_VND
  if (from === 'VND' && to === 'USD') return amount / USD_TO_VND
  return amount
}
