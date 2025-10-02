export function parsePriceFilter(
  label?: string,
):
  | { kind: 'free' }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'min'; min: number }
  | null {
  if (!label) return null;

  const clean = label.trim();

  // Gratis
  if (/gratis/i.test(clean)) return { kind: 'free' };

  // "5000+"
  const plus = clean.match(/\$?\s*([\d.]+)\s*\+$/);
  if (plus) {
    const min = Number(plus[1].replace(/\./g, ''));
    return Number.isFinite(min) ? { kind: 'min', min } : null;
  }

  // "$13000-20000" (guion normal o en-dash)
  const range = clean.match(/\$?\s*([\d.]+)\s*[-–—]\s*\$?\s*([\d.]+)/);
  if (range) {
    const min = Number(range[1].replace(/\./g, ''));
    const max = Number(range[2].replace(/\./g, ''));
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      return { kind: 'range', min, max };
    }
    return null;
  }

  return null;
}
