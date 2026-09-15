// Blue -> green -> yellow -> red -> purple gradient, keyed by bet size.
const GRADIENT_STOPS = [
  { r: 74, g: 144, b: 226 }, // blue
  { r: 46, g: 204, b: 113 }, // green
  { r: 241, g: 196, b: 15 }, // yellow
  { r: 231, g: 76, b: 60 }, // red
  { r: 155, g: 89, b: 182 }, // purple
];

export const getBetThemeColor = (bet: number, min: number, max: number): string => {
  const t = max > min ? Math.max(0, Math.min(1, (bet - min) / (max - min))) : 0;
  const segment = t * (GRADIENT_STOPS.length - 1);
  const index = Math.min(Math.floor(segment), GRADIENT_STOPS.length - 2);
  const localT = segment - index;

  const from = GRADIENT_STOPS[index];
  const to = GRADIENT_STOPS[index + 1];
  const r = Math.round(from.r + (to.r - from.r) * localT);
  const g = Math.round(from.g + (to.g - from.g) * localT);
  const b = Math.round(from.b + (to.b - from.b) * localT);

  return `rgb(${r}, ${g}, ${b})`;
};
