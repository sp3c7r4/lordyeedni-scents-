/** Money formatter. Whole dollars only, to match the price list. */
export const money = (value: number) => '$' + Math.round(value);

/** Five-character star string for a 0-5 rating. */
export const stars = (rating: number) => {
  const full = Math.round(rating);
  return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
};

export const isEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(value.trim());
