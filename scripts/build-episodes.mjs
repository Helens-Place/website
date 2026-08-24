/**
 * Turns the Vimeo caption exports into the elevator-series content file.
 *
 * The captions are auto-generated, so a small map of high confidence
 * corrections is applied: organisation names that speech recognition
 * consistently mangles. Anything uncertain is left alone rather than guessed
 * at, because putting invented words in Helen's mouth is worse than leaving an
 * obvious wobble in a transcript that is clearly labelled as auto-generated.
 *
 *   node scripts/build-episodes.mjs "<folder holding the caption txt files>"
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Pass the folder holding the caption .txt files.');
  process.exit(1);
}

/** number, vimeo id, vimeo hash, title, Helen's own description from the old site */
const EPISODES = [
  [1, '498699690', '', 'An introduction',
    'Introduces the series and the elevator pitch idea behind it: two minutes or less to cover the key points.'],
  [2, '501210762', '6ba6dbf351', 'So you find reading tricky?',
    'Why people may find reading tricky, what it looks like in the classroom, and what we can do to support people to read with confidence.'],
  [3, '503789251', '7375a54652', 'You are not really into writing?',
    'A brief discussion of writing development, supporting reluctant writers, and some resources.'],
  [4, '506494768', 'f0c384d66d', 'Spelling does not make sense?',
    'What underpins someone’s ability to spell, and some small things you can do to help.'],
  [5, '509255918', 'b72df273dd', 'You just cannot remember stuff?',
    'Having a rocky memory is really tricky to deal with, so here are some ideas that help.'],
  [6, '511926418', 'a6fa9192ed', 'What do you think goes first?',
    'The difficulties some people have in starting tasks or knowing how to plan things, with tips and resources.'],
  [7, '515310258', 'c9ddad0757', 'You are amazing verbally',
    'The often perceptible gap between how well someone with dyslexia expresses themselves aloud and on paper.'],
  [8, '517478568', '482446818b', 'What if you are dyslexic?',
    'A quick discussion of what to do if you think that you are dyslexic.'],
  [9, '520407503', '5b6f5fc32d', 'Who can help you understand you?',
    'The different ways dyslexia and other specific learning difficulties can be assessed, and where to find appropriately qualified assessors.'],
  [10, '523171123', 'd30e2c7a4a', 'How does assessment work?',
    'What an assessment is actually like: an overview of what we do and how we do it.'],
  [11, '526667104', 'c892947ee6', 'You have been assessed',
    'What to do with what you have learned from your assessment, and how to make sense of it.'],
  [12, '536926837', '06ebcdf504', 'What do you want and need?',
    'What you might want, and the type of support that would be useful, once you have had an assessment and read your report.'],
  [13, '536916878', 'a4aec5085a', 'Who do you want to be?',
    'What it means to be dyslexic, focusing on the strengths you have.'],
  [14, '545487784', 'b4f25bb68a', 'You can do this',
    'Seeing the strengths in your dyslexia and working out what you want to do with them.'],
];

/** Names speech recognition consistently mangles. All verified. */
const FIXES = [
  [/\bSanko\b/gi, 'SENCo'],
  [/\bsame coat\b/gi, 'SENCo'],
  [/\bNess(ie|y|ey)\b/gi, 'Nessy'],
  [/\bNesi\b/g, 'Nessy'],
  [/\bNursey\b/gi, 'Nessy'],
  [/\bPlateaux\b/gi, 'PATOSS'],
  [/\bunits of sand\b/gi, 'Units of Sound'],
  [/\bideal dyslexia\b/gi, 'IDL Dyslexia'],
  [/Wiltshire men's team/gi, 'Wiltshire SEN team'],
  [/My map's again/g, 'Mind maps again'],
  [/because some vocalising/gi, 'because sub-vocalising'],
  [/\bsegue way\b/gi, 'segue'],
  [/^Said six of the elevator series/i, 'Episode six of the elevator series'],
  [/their inspirational, their amazing people/gi, 'they are inspirational, they are amazing people'],
  [/\bBritish British Dyslexia Association\b/g, 'British Dyslexia Association'],
  [/\bopening opening lines\b/g, 'opening lines'],
];

const toParagraphs = (srt) => {
  let text = srt
    .split(/\r?\n\r?\n/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .filter((l) => !/^\d+$/.test(l.trim()) && !l.includes('-->'))
        .join(' '),
    )
    .join(' ')
    .replace(/\[Auto-generated transcript\.[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [re, to] of FIXES) text = text.replace(re, to);

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const paras = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paras.push(sentences.slice(i, i + 3).join(' ').replace(/\s+/g, ' ').trim());
  }
  return paras.filter(Boolean);
};

let out = `---
title: The Elevator Series, short videos about dyslexia
description: >-
  Fourteen short videos from Dr Helen Ross covering the whole dyslexia journey,
  from the first signs through assessment to understanding your own strengths.
  Each is about two minutes, and each has a full transcript.
eyebrow: Watch
heading: The Elevator Series
audience: families
intro: >-
  Each of these videos is built on the idea of an elevator pitch: two minutes or
  less to cover the key points. Together they follow a whole dyslexia journey,
  from wondering whether you might be dyslexic, through what an assessment
  actually involves, to working out who you want to be. Every episode has a full
  transcript underneath it.
primaryCta:
  label: Book a free 20-minute call
  href: /contact
episodes:
`;

/** Public oEmbed gives the real duration, upload date and thumbnail, which is
    what a complete VideoObject needs. Guessing them would be worse than none. */
const meta = async (id, hash) => {
  const target = `https://vimeo.com/${id}` + (hash ? `?h=${hash}` : '');
  const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target)}&width=1280`;
  const r = await fetch(url);
  if (!r.ok) { console.warn(`  oEmbed failed for ${id}: ${r.status}`); return null; }
  const d = await r.json();
  return {
    seconds: d.duration,
    uploadDate: (d.upload_date || '').split(' ')[0],
    thumbnail: d.thumbnail_url,
  };
};

const iso = (sec) => {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `PT${m}M${s}S`;
};

for (const [number, vimeoId, vimeoHash, title, description] of EPISODES) {
  const file = path.join(
    SRC,
    `The_Elevator_Series-_Episode_${number}_Captions_English (United Kingdom).txt`,
  );
  const paras = toParagraphs(readFileSync(file, 'utf8'));
  const m = await meta(vimeoId, vimeoHash);
  out += `  - number: ${number}\n`;
  out += `    title: ${JSON.stringify(title)}\n`;
  out += `    description: ${JSON.stringify(description)}\n`;
  out += `    vimeoId: ${JSON.stringify(vimeoId)}\n`;
  out += `    vimeoHash: ${JSON.stringify(vimeoHash)}\n`;
  if (m) {
    out += `    duration: ${JSON.stringify(iso(m.seconds))}\n`;
    out += `    uploadDate: ${JSON.stringify(m.uploadDate)}\n`;
    out += `    thumbnail: ${JSON.stringify(m.thumbnail)}\n`;
  }
  out += `    transcript:\n`;
  for (const p of paras) out += `      - ${JSON.stringify(p)}\n`;
}
out += '---\n';

writeFileSync('src/content/pages/elevator-series.md', out, 'utf8');
console.log(`Wrote ${EPISODES.length} episodes to src/content/pages/elevator-series.md`);
