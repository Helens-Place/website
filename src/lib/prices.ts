/**
 * Every price on the site is typed once, in Site settings > Prices. Everywhere
 * else carries a marker that is filled in as each page is built:
 *
 *   [price: Full diagnostic assessment]    becomes  from £450
 *   [amount: Full diagnostic assessment]   becomes  450
 *
 * `amount` is the bare number, for structured data that wants one.
 *
 * Why: the same fee was typed 45 times across 11 files and had already drifted,
 * "from £450" on some pages and a flat "£450" on others. Changing a price meant
 * finding every copy. Now it means changing one line.
 *
 * A marker naming a price that does not exist stops the build with an error,
 * so a typo can never reach a visitor as a raw marker or a blank.
 */

export interface Price { name: string; price: string }

const MARKER = /\[(price|amount):\s*([^\]]+?)\s*\]/gi;

const key = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/* A marker at the start of a sentence gets a capital: "From £180" rather than
   "from £180". Start of a sentence means the start of the text, after a full
   stop, or straight after an opening tag or quote. */
const SENTENCE_START = /(^|[.!?]\s+|>\s*|"\s*)$/;

export function resolvePrices(text: string, prices: Price[], where = 'page'): string {
  if (!text.includes('[')) return text;
  const table = new Map(prices.map((p) => [key(p.name), p.price]));

  for (const p of prices) {
    if (/[<>&"]/.test(p.price)) {
      throw new Error(`Price "${p.name}" contains < > & or ", which cannot be shown safely. Change it in Site settings > Prices.`);
    }
  }

  return text.replace(MARKER, (_, kind: string, name: string, offset: number, whole: string) => {
    const price = table.get(key(name));
    if (price === undefined) {
      const known = prices.map((p) => p.name).join(', ');
      throw new Error(`Unknown price "${name}" on ${where}. Known prices are: ${known}. Check the spelling, or add it in Site settings > Prices.`);
    }
    if (kind.toLowerCase() === 'amount') {
      const n = price.replace(/,/g, '').match(/\d+(\.\d+)?/);
      if (!n) throw new Error(`Price "${name}" has no number in it, so [amount: ${name}] cannot be filled in.`);
      return n[0];
    }
    return SENTENCE_START.test(whole.slice(Math.max(0, offset - 4), offset))
      ? price.charAt(0).toUpperCase() + price.slice(1)
      : price;
  });
}
