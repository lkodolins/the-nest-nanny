export type CurrencyCode = 'EUR' | 'USD' | 'QAR'

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  USD: '$',
  QAR: 'QR',
}

/**
 * Format a numeric value as a currency string.
 *
 * @example
 * formatCurrency(22, 'EUR')  // '€22'
 * formatCurrency(55.5, 'USD') // '$55.50'
 * formatCurrency(100, 'QAR') // 'QR100'
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'EUR',
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const hasDecimals = amount % 1 !== 0
  const formatted = hasDecimals ? amount.toFixed(2) : String(amount)
  return `${symbol}${formatted}`
}

/**
 * Format a currency range, e.g. '€18 – €25'
 */
export function formatCurrencyRange(
  min: number,
  max: number,
  currency: CurrencyCode = 'EUR',
): string {
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
}
