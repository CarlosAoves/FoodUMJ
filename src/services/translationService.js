/**
 * Serviço de tradução automática baseado na API pública gratuita MyMemory.
 * Inclui cache em memória, timeout defensivo e fallback para o texto original.
 */

const CACHE = new Map();
const TIMEOUT_MS = 2500;
const EMAIL_CONTACT = 'eitor2006@gmail.com'; // Aumenta a cota diária gratuita para 50.000 caracteres

/**
 * Traduz um texto curto (termo de busca ou título de receita).
 * Se a requisição falhar, demorar ou exceder o limite, retorna o texto original com segurança.
 *
 * @param {string} text - Texto a ser traduzido
 * @param {string} fromLang - Idioma de origem ('pt-BR' ou 'en')
 * @param {string} toLang - Idioma de destino ('en' ou 'pt-BR')
 * @returns {Promise<string>}
 */
export async function translateText(text, fromLang = 'en', toLang = 'pt-BR') {
  if (!text || typeof text !== 'string') return '';

  const cleanText = text.trim();
  if (!cleanText) return '';

  const cacheKey = `${fromLang}:${toLang}:${cleanText.toLowerCase()}`;
  if (CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const encodedText = encodeURIComponent(cleanText);
    const langPair = encodeURIComponent(`${fromLang}|${toLang}`);
    const emailParam = encodeURIComponent(EMAIL_CONTACT);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}&de=${emailParam}`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return cleanText;
    }

    const data = await response.json();
    const translated = data?.responseData?.translatedText;

    // Se o serviço retornar mensagem de limite ou texto vazio, usa o original
    if (
      !translated ||
      typeof translated !== 'string' ||
      translated.toUpperCase().includes('MYMEMORY WARNING')
    ) {
      return cleanText;
    }

    CACHE.set(cacheKey, translated);
    return translated;
  } catch (error) {
    // Timeout ou erro de conexão: fallback imediato para o texto original
    clearTimeout(timeoutId);
    return cleanText;
  }
}
