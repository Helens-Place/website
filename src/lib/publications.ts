/**
 * Turns the publications list into ScholarlyArticle structured data, so search
 * engines and AI assistants can tie each paper to Helen as its author.
 *
 * Reads the page body Helen edits in Tina, rather than a second copy of the
 * list, so a paper she adds there is picked up here without anyone touching
 * code. Only entries with a DOI are included: the DOI is what lets a machine
 * be sure it is the same paper it already knows about.
 *
 * Expects the citation style the page already uses:
 *   - Surname, I., Surname, I. and Surname, I. (2024) 'Title', *Journal*, ...
 *     [DOI](https://doi.org/...)
 */
import { IDS } from './schema';

const ITEM = /^- ([\s\S]*?)(?=^- |^#|(?![\s\S]))/gm;
const CITATION = /^(.+?)\s*\((\d{4})[^)]*\)\s*['‘]([\s\S]+?)['’](,|\s+in\b)[\s\S]*?\*([^*]+)\*/;
const DOI = /\]\((https:\/\/doi\.org\/[^)\s]+)\)/;
const AUTHOR = /(\p{Lu}[\p{L}'’-]+), ((?:\p{Lu}\.\s?)+|\p{Lu}\p{Ll}+)/gu;

const isHelen = (surname: string) => surname === 'Ross';

export function scholarlyArticles(body: string) {
  const out = [];
  for (const [, raw] of body.matchAll(ITEM)) {
    const text = raw.replace(/\s+/g, ' ').trim();
    const doi = text.match(DOI)?.[1];
    const c = text.match(CITATION);
    if (!doi || !c) continue;
    const [, authors, year, title, joiner, container] = c;
    /* "'Title' in *Book*" is a chapter; "'Title', *Journal*" is an article. */
    const chapter = joiner.trim() === 'in';

    const people = [...authors.matchAll(AUTHOR)].map(([, surname, given]) =>
      isHelen(surname)
        ? { '@id': IDS.person }
        : { '@type': 'Person', name: `${given.trim()} ${surname}` });
    if (!people.some((p) => '@id' in p)) continue;

    out.push({
      '@type': chapter ? 'Chapter' : 'ScholarlyArticle',
      headline: title.trim(),
      author: people,
      datePublished: year,
      isPartOf: { '@type': chapter ? 'Book' : 'Periodical', name: container.trim() },
      url: doi,
      sameAs: doi,
    });
  }
  return out;
}
