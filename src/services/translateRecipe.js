import { RECIPE_LANGUAGE } from '../i18n/recipeLocale.js';
import { MAX_TRANSLATION_BYTES, translateSegments, utf8ByteLength } from './translationService.js';

const units = {
  'pt-BR': {
    cup: ['xícara', 'xícaras'],
    inch: ['polegada', 'polegadas'],
    tbsp: ['colher de sopa', 'colheres de sopa'],
    tsp: ['colher de chá', 'colheres de chá'],
    oz: ['onça', 'onças'],
    'fl oz': ['onça fluida', 'onças fluidas'],
    lb: ['libra', 'libras'],
    minute: ['minuto', 'minutos'],
    hour: ['hora', 'horas'],
    second: ['segundo', 'segundos'],
  },
  fr: {
    cup: ['tasse', 'tasses'],
    inch: ['pouce', 'pouces'],
    tbsp: ['cuillère à soupe', 'cuillères à soupe'],
    tsp: ['cuillère à café', 'cuillères à café'],
    oz: ['once', 'onces'],
    'fl oz': ['once liquide', 'onces liquides'],
    lb: ['livre', 'livres'],
    minute: ['minute', 'minutes'],
    hour: ['heure', 'heures'],
    second: ['seconde', 'secondes'],
  },
};
const unitAliases = {
  tablespoon: 'tbsp',
  teaspoon: 'tsp',
  ounce: 'oz',
  pound: 'lb',
  min: 'minute',
  hr: 'hour',
  sec: 'second',
};

const protectedPattern = /(\d+(?:[.,]\d+)?(?:[ \t]+\d+[ \t]*[/⁄][ \t]*\d+|[ \t]*[/⁄][ \t]*\d+|[ \t]*[¼-¾⅐-⅞]|(?:[ \t]*[x×][ \t]*\d+(?:[.,]\d+)?)+)?|[¼-¾⅐-⅞]|\b(?:a[ \t]+)?couple[ \t]+of(?=[ \t]+(?:minutes?|hours?|seconds?)\b))(?:[ \t-]*(°[ \t]*[CF]|[CF]\b|fl[ \t]+oz|inches|inch|cups?|tablespoons?|tbsps?|teaspoons?|tsps?|ounces?|oz|pounds?|lbs?|minutes?|mins?|hours?|hrs?|seconds?|secs?|kg|mg|ml|g|l)(?![a-z]))?|(\b(?:green chill(?:i|ies)|red chilli powder)\b)/gi;
const placeholderPattern = /\[\[\d+\]\]/g;
const culinaryTerms = {
  'pt-BR': {
    'green chilli': 'pimenta verde',
    'green chillies': 'pimentas verdes',
    'red chilli powder': 'pimenta vermelha em pó',
  },
  fr: {
    'green chilli': 'piment vert',
    'green chillies': 'piments verts',
    'red chilli powder': 'piment rouge en poudre',
  },
};

function protectValues(line, language) {
  const values = [];
  function protect(original, localized) {
    values.push({ original, localized });
    return '[[' + (values.length - 1) + ']]';
  }
  const text = line.replace(protectedPattern, (original, quantity, unit, term) => {
    if (term) {
      const translated = culinaryTerms[language][term.toLowerCase()];
      const localized = /^[A-Z]/.test(term) ? translated[0].toUpperCase() + translated.slice(1) : translated;
      return protect(original, localized);
    }
    const normalized = unit?.toLowerCase().replace(/[ \t]+/g, ' ');
    const key = normalized === 'inches' ? 'inch' : normalized?.replace(/s$/, '');
    const names = units[language][unitAliases[key] ?? key];
    const fraction = quantity.match(/^(\d+)[ \t]*[/⁄][ \t]*(\d+)$/);
    const singular = quantity === '1' || /^[¼-¾⅐-⅞]$/.test(quantity) ||
      (fraction && Number(fraction[1]) <= Number(fraction[2]));
    const approximateTwo = language === 'fr' ? 'environ deux' : 'cerca de dois';
    const amount = /couple/i.test(quantity) ? approximateTwo : quantity;
    return protect(original, names ? amount + ' ' + names[singular ? 0 : 1] : original);
  });
  return { text, values };
}

function restoreValues(text, values, localized) {
  return text.replace(placeholderPattern, (token) => {
    const value = values[Number(token.slice(2, -2))];
    return localized ? value.localized : value.original;
  });
}

function splitLine(line) {
  const parts = [];
  let remaining = line;
  while (utf8ByteLength(remaining) > MAX_TRANSLATION_BYTES) {
    let wordBoundary;
    let sentenceBoundary;
    for (const gap of remaining.matchAll(/[ \t]+/g)) {
      const before = remaining.slice(0, gap.index);
      if (utf8ByteLength(before) > MAX_TRANSLATION_BYTES) break;
      if (!before.trim()) continue;
      wordBoundary = gap;
      if (/[.!?]["'”)]?$/.test(before)) sentenceBoundary = gap;
    }
    const boundary = sentenceBoundary ?? wordBoundary;
    if (!boundary) return null;
    parts.push([remaining.slice(0, boundary.index), boundary[0]]);
    remaining = remaining.slice(boundary.index + boundary[0].length);
  }
  parts.push([remaining, '']);
  return parts;
}

function prepareText(text, language) {
  if (typeof text !== 'string' || !text.trim()) return [text];

  return text.split(/(\r\n|\r|\n)/).flatMap((line) => {
    if (!line.trim()) return [line];
    if (/\[\[\d+\]\]/.test(line)) return [{ source: line }];

    const { text: protectedText, values } = protectValues(line, language);
    const parts = splitLine(protectedText);
    if (!parts) return [{ source: line }];

    return parts.flatMap(([part, separator]) => {
      const query = part.trim();
      if (!/[a-zà-öø-ÿ]/i.test(query)) {
        return [restoreValues(part, values, true), separator];
      }
      return [{
        query,
        source: restoreValues(part, values, false),
        restore: (translated) => part.replace(query, () => restoreValues(translated, values, true)),
      }, separator];
    });
  });
}

function prepareMeasure(measure, language) {
  if (typeof measure !== 'string' || !measure.trim()) return [measure];
  if (/^to taste$/i.test(measure.trim())) return [language === 'fr' ? 'selon le goût' : 'a gosto'];
  if (/\[\[\d+\]\]/.test(measure)) return [{ source: measure }];

  const { text, values } = protectValues(measure, language);
  const prefix = text.match(/^\[\[0\]\][ \t]+/)?.[0];
  if (!prefix) return prepareText(measure, language);

  const qualifier = restoreValues(text.slice(prefix.length), values, false);
  return [restoreValues(prefix, values, true), ...prepareText(qualifier, language)];
}

async function translatePlans(plans, targetLanguage, options) {
  const parts = plans.flat().filter((part) => part?.query);
  const translated = await translateSegments(parts, 'en', targetLanguage, options);
  return new Map(parts.map((part, index) => [part, translated[index]]));
}

function renderPlan(plan, translations, isInstruction = false) {
  let usedOriginal = false;
  const text = plan.map((part) => {
    if (typeof part !== 'object' || part === null) return part ?? '';
    const translated = translations.get(part);
    if (translated && (!isInstruction || translated.toLowerCase() !== part.query.toLowerCase())) {
      return part.restore(translated);
    }
    usedOriginal = true;
    return part.source;
  }).join('');
  return { text, usedOriginal };
}

export async function translateRecipeTitles(names) {
  try {
    const plans = names.map((name) => prepareText(name, RECIPE_LANGUAGE));
    const translations = await translatePlans(plans, RECIPE_LANGUAGE);
    return plans.map((plan) => renderPlan(plan, translations).text);
  } catch {
    return names;
  }
}

export async function translateRecipe(recipe, { targetLanguage = RECIPE_LANGUAGE, signal } = {}) {
  if (targetLanguage !== 'pt-BR' && targetLanguage !== 'fr') {
    return { recipe, usedOriginal: false };
  }

  try {
    const name = prepareText(recipe.name, targetLanguage);
    const ingredients = recipe.ingredients.map((ingredient) => ({
      name: prepareText(ingredient.name, targetLanguage),
      measure: prepareMeasure(ingredient.measure, targetLanguage),
    }));
    const instructions = prepareText(recipe.instructions, targetLanguage);
    const short = [name, ...ingredients.flatMap(({ name, measure }) => [name, measure])];
    const [shortTranslations, instructionTranslations] = await Promise.all([
      translatePlans(short, targetLanguage, { signal }),
      translatePlans([instructions], targetLanguage, { signal, batch: false }),
    ]);

    let usedOriginal = false;
    function render(plan, translations, isInstruction) {
      const result = renderPlan(plan, translations, isInstruction);
      usedOriginal ||= result.usedOriginal;
      return result.text;
    }

    const translatedRecipe = {
      ...recipe,
      name: render(name, shortTranslations),
      ingredients: ingredients.map((plan, index) => {
        const original = recipe.ingredients[index];
        const translatedName = render(plan.name, shortTranslations);
        return {
          ...original,
          name: targetLanguage === 'pt-BR' && /^chicken$/i.test(original.name) && /^galinha[.!]?$/i.test(translatedName)
            ? 'Frango'
            : translatedName,
          measure: render(plan.measure, shortTranslations),
        };
      }),
      instructions: render(instructions, instructionTranslations, true),
    };
    return { recipe: translatedRecipe, usedOriginal };
  } catch {
    return { recipe, usedOriginal: true };
  }
}
