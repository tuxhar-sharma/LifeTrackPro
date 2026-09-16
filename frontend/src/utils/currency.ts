export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', name: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)' },
  { code: 'AED', symbol: 'AED', name: 'AED (د.إ)' },
  { code: 'SGD', symbol: 'S$', name: 'SGD (S$)' },
  { code: 'CHF', symbol: 'CHF', name: 'CHF' },
];

export const getStoredCurrency = (): string => {
  return localStorage.getItem('lifetrack_preferred_currency') || 'USD';
};

export const setStoredCurrency = (code: string): void => {
  localStorage.setItem('lifetrack_preferred_currency', code);
};

export const getCurrencySymbol = (code: string = 'USD'): string => {
  const match = CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return match ? match.symbol : code;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
};
