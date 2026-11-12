export const RECIPE_LANGUAGE = 'pt-BR';

function primaryLanguage(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().match(/^([a-z]{2,3})(?:[-_][a-z0-9]{1,8})*$/)?.[1] ?? '';
}

export function getRecipeLanguage(locale) {
  const code = primaryLanguage(locale?.languageCode);
  const preferred = code && code !== 'und' ? code : primaryLanguage(locale?.languageTag);
  if (preferred === 'pt') return 'pt-BR';
  if (preferred === 'fr') return 'fr';
  return 'en';
}

export const recipeMessages = {
  'pt-BR': {
    title: 'Receita',
    loading: 'Carregando receita...',
    translating: 'Traduzindo receita...',
    loadError: 'Não foi possível carregar a receita.',
    retry: 'Tentar novamente',
    notFound: 'Receita não encontrada.',
    translationUnavailable: 'Tradução indisponível. Exibindo a receita no idioma original.',
    imageLabel: (name) => `Foto de ${name}`,
    imageUnavailable: 'Imagem indisponível.',
    ingredients: 'Ingredientes',
    ingredientsUnavailable: 'Ingredientes não disponíveis para esta receita.',
    instructions: 'Modo de preparo',
    instructionsUnavailable: 'Modo de preparo não disponível para esta receita.',
  },
  en: {
    title: 'Recipe',
    loading: 'Loading recipe...',
    translating: 'Translating recipe...',
    loadError: 'Could not load the recipe.',
    retry: 'Try again',
    notFound: 'Recipe not found.',
    translationUnavailable: 'Translation unavailable. Showing the original recipe.',
    imageLabel: (name) => `Photo of ${name}`,
    imageUnavailable: 'Image unavailable.',
    ingredients: 'Ingredients',
    ingredientsUnavailable: 'Ingredients are unavailable for this recipe.',
    instructions: 'Method',
    instructionsUnavailable: 'Cooking instructions are unavailable for this recipe.',
  },
  fr: {
    title: 'Recette',
    loading: 'Chargement de la recette…',
    translating: 'Traduction de la recette…',
    loadError: 'Impossible de charger la recette.',
    retry: 'Réessayer',
    notFound: 'Recette introuvable.',
    translationUnavailable: 'Traduction indisponible. La recette est affichée dans sa langue d’origine.',
    imageLabel: (name) => `Photo de ${name}`,
    imageUnavailable: 'Image indisponible.',
    ingredients: 'Ingrédients',
    ingredientsUnavailable: 'Les ingrédients de cette recette ne sont pas disponibles.',
    instructions: 'Préparation',
    instructionsUnavailable: 'Le mode de préparation de cette recette n’est pas disponible.',
  },
};
