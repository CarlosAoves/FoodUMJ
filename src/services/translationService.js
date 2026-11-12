import { RECIPE_LANGUAGE } from '../i18n/recipeLocale.js';

const ENDPOINT = 'https://api.mymemory.translated.net/get';
// Contato autorizado apenas para a validação na worktree experimental.
export const MAX_TRANSLATION_BYTES = 500;
const REQUEST_TIMEOUT_MS = 6500;
const TRANSLATION_TIMEOUT_MS = 35000;
const MAX_CONCURRENT_REQUESTS = 3;
const CACHE_LIMIT = 400;
const DEFAULT_COOLDOWN_MS = 60000;

const cache = new Map();
const inFlight = new Map();
const activeRequests = new Set();
let quotaBlockedUntil = 0;

const warningPattern = /MYMEMORY WARNING|QUERY LENGTH LIMIT|USAGE LIMIT|TOO MANY REQUESTS|QUOTA EXCEEDED/i;
const quotaPattern = /used all available free translations|daily quota|quota exceeded|usage limit|too many requests/i;
const valuePattern = /\[\[\d+\]\]|\d+(?:[.,]\d+)?|[¼-¾⅐-⅞]/g;

export function utf8ByteLength(text) {
  return encodeURIComponent(text).replace(/%[a-f\d]{2}/gi, '_').length;
}

function decodeTranslation(text) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()];
    const hex = code[1].toLowerCase() === 'x';
    const value = parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : entity;
  });
}

function blockQuota(response) {
  const value = response.headers?.get('retry-after')?.trim() ?? '';
  const now = Date.now();
  const until = /^\d+$/.test(value) ? now + Number(value) * 1000 : Date.parse(value);
  quotaBlockedUntil = Math.max(
    quotaBlockedUntil,
    Number.isFinite(until) && until > now ? until : now + DEFAULT_COOLDOWN_MS,
  );
}

async function requestTranslation(text, languagePair, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const url = ENDPOINT + '?q=' + encodeURIComponent(text) +
      '&langpair=' + encodeURIComponent(languagePair);
    const response = await fetch(url, { signal: controller.signal });
    if (response.status === 429) {
      blockQuota(response);
      return [];
    }
    if (response.status >= 500) {
      throw new Error('MyMemory HTTP ' + response.status);
    }

    const data = await response.json().catch(() => null);
    const primary = data?.responseData?.translatedText;
    if (data?.quotaFinished === true || Number(data?.responseStatus) === 429 ||
        quotaPattern.test(data?.responseDetails ?? '') || quotaPattern.test(primary ?? '')) {
      blockQuota(response);
      return [];
    }
    if (controller.signal.aborted) throw new Error('Tempo limite da MyMemory.');
    if (response.status === 401 || response.status === 403) throw new Error('Acesso à MyMemory indisponível.');
    if (!response.ok || Number(data?.responseStatus) !== 200 || typeof primary !== 'string' || !primary.trim()) {
      return [];
    }

    const machineMatch = Array.isArray(data.matches)
      ? data.matches.find((match) => match?.['created-by'] === 'MT!' &&
          typeof match.segment === 'string' && match.segment.trim() === text)
      : undefined;

    return [machineMatch?.translation, primary]
      .filter((candidate) => typeof candidate === 'string' && candidate.trim() && !warningPattern.test(candidate))
      .map((candidate) => decodeTranslation(candidate).trim());
  } finally {
    clearTimeout(timer);
  }
}

function canRequest(context) {
  return !context.unavailable && Date.now() < context.deadline && Date.now() >= quotaBlockedUntil;
}

async function fetchCandidates(text, context) {
  while (canRequest(context) && activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
    await Promise.race(activeRequests);
  }
  if (!canRequest(context)) return [];

  const timeout = Math.min(REQUEST_TIMEOUT_MS, context.deadline - Date.now());
  const request = requestTranslation(text, context.languagePair, timeout);
  const slot = request.then(() => {}, () => {});
  activeRequests.add(slot);
  try {
    return await request;
  } catch {
    context.unavailable = true;
    return [];
  } finally {
    activeRequests.delete(slot);
  }
}

function preservesValues(source, translated) {
  const expected = source.match(valuePattern) ?? [];
  const actual = translated.match(valuePattern) ?? [];
  return /[a-zà-öø-ÿ]/i.test(translated) && expected.length === actual.length &&
    expected.every((value, index) => value === actual[index]);
}

function label(item, index) {
  return '[[' + (1000 + index) + ']] ' + item.query;
}

function makeGroups(items, batch) {
  if (!batch) return items.map((item) => [item]);

  const groups = [];
  let group = [];
  for (const item of items) {
    const combined = [...group, item].map(label).join('\n');
    if (group.length && utf8ByteLength(combined) > MAX_TRANSLATION_BYTES) {
      groups.push(group);
      group = [];
    }
    group.push(item);
  }
  if (group.length) groups.push(group);
  return groups;
}

function readBatch(text, items) {
  const markers = [...text.matchAll(/\[\[(1\d{3})\]\]/g)];
  if (markers.length !== items.length || text.slice(0, markers[0].index).trim()) return [];
  if (markers.some((marker, index) => Number(marker[1]) !== 1000 + index)) return [];

  return markers.map((marker, index) => {
    const value = text.slice(marker.index + marker[0].length, markers[index + 1]?.index).trim();
    return preservesValues(items[index].query, value) ? value : undefined;
  });
}

function claim(key) {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  inFlight.set(key, promise);
  return (value) => {
    if (value !== undefined) {
      cache.set(key, value);
      if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
    }
    inFlight.delete(key);
    resolve(value);
  };
}

async function translateGroup(items, context, results) {
  const owned = [];
  const waiting = [];
  for (const item of items) {
    if (cache.has(item.key)) {
      results.set(item.key, cache.get(item.key));
    } else if (inFlight.has(item.key)) {
      waiting.push(inFlight.get(item.key).then((value) => results.set(item.key, value)));
    } else if (!context.signal?.aborted && canRequest(context)) {
      owned.push({ ...item, finish: claim(item.key) });
    }
  }

  // A requisição já reservada pode ter consumidores de outra tela.
  try {
    if (owned.length > 1) {
      const candidates = await fetchCandidates(owned.map(label).join('\n'), context);
      for (const candidate of candidates) {
        readBatch(candidate, owned).forEach((value, index) => {
          if (value !== undefined && !results.has(owned[index].key)) results.set(owned[index].key, value);
        });
      }
    }

    for (const item of owned) {
      if (results.has(item.key) || !canRequest(context)) continue;
      const candidates = await fetchCandidates(item.query, context);
      results.set(item.key, candidates.find((candidate) => preservesValues(item.query, candidate)));
    }
  } finally {
    for (const item of owned) item.finish(results.get(item.key));
  }

  await Promise.all(waiting);
}

// A chave inclui o texto original e o par. O segmento protegido diferencia formas
// com marcadores distintos, mesmo quando o trecho original é idêntico.
export async function translateSegments(segments, fromLang, toLang, { signal, batch = true } = {}) {
  if (fromLang === toLang || signal?.aborted) return segments.map(() => undefined);

  const languagePair = fromLang + '|' + toLang;
  const items = segments.map(({ source, query }) => {
    if (!query || utf8ByteLength(query) > MAX_TRANSLATION_BYTES) return null;
    return { query, key: JSON.stringify([languagePair, source, query]) };
  });
  const distinct = new Map(items.filter(Boolean).map((item) => [item.key, item]));
  const groups = makeGroups([...distinct.values()], batch);
  const results = new Map();
  const context = { languagePair, signal, deadline: Date.now() + TRANSLATION_TIMEOUT_MS, unavailable: false };
  let nextGroup = 0;
  async function work() {
    while (nextGroup < groups.length && !signal?.aborted) {
      await translateGroup(groups[nextGroup++], context, results);
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_REQUESTS, groups.length) }, work));
  return items.map((item) => results.get(item?.key));
}

/** Traduz um termo de busca e mantém o original em caso de falha. */
export async function translateText(text, fromLang = 'en', toLang = RECIPE_LANGUAGE) {
  if (typeof text !== 'string') return '';
  const source = text.trim();
  if (!source) return '';
  try {
    const [translated] = await translateSegments([{ source, query: source }], fromLang, toLang);
    return translated ?? source;
  } catch {
    return source;
  }
}
