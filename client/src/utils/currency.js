/** Format amount as Hong Kong dollars (HKD). */
export function hk$(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'HK$0.00';
  return `HK$${n.toFixed(2)}`;
}
