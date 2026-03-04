'use client';

type CurrencyProps = {
  amount: number;
  currency?: string;
};

export function Currency({ amount, currency = 'THB' }: CurrencyProps) {
  return (
    <span>
      {new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)}
    </span>
  );
}
