export const wrap = (value: number, min: number, max: number) => {
  const range = max - min;
  const normalized = value - min;

  if (range === 1) return min;

  if (normalized >= range) {
    return (normalized % range) + min;
  } else if (normalized < 0) {
    return range - (Math.abs(normalized) % range) + min;
  }

  return value;
};
