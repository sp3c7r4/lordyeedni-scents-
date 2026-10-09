/** Money formatter. Whole Naira only, thousands separated. The regex beats
 * toLocaleString here: it cannot drift with the runtime's ICU data, so the
 * server and the client always render the same string. */
export const money = (value: number) =>
  '\u20A6' + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Five-character star string for a 0-5 rating. */
export const stars = (rating: number) => {
  const full = Math.round(rating);
  return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
};

export const isEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(value.trim());
