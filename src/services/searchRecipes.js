import { RECIPE_LANGUAGE } from '../i18n/recipeLocale.js';
import { translateRecipeTitles } from './translateRecipe.js';
import { translateText } from './translationService.js';

/**
 * Dicionário de termos comuns em português mapeados para o catálogo da TheMealDB.
 * Permite que o usuário pesquise ingredientes e pratos em português de forma instantânea.
 */
export const PORTUGUESE_TERMS_MAP = {
  frango: 'chicken',
  macarrao: 'pasta',
  macarrão: 'pasta',
  massa: 'pasta',
  sopa: 'soup',
  carne: 'beef',
  boi: 'beef',
  porco: 'pork',
  peixe: 'fish',
  bolo: 'cake',
  torta: 'pie',
  arroz: 'rice',
  salada: 'salad',
  chocolate: 'chocolate',
  queijo: 'cheese',
  sobremesa: 'dessert',
  cordeiro: 'lamb',
  camarao: 'shrimp',
  camarão: 'shrimp',
  batata: 'potato',
  pao: 'bread',
  pão: 'bread',
  ovo: 'egg',
  ovos: 'egg',
  pizza: 'pizza',
  pudim: 'pudding',
};

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

/**
 * Traduz termos conhecidos via mapa estático (0ms).
 * Mantido para compatibilidade síncrona.
 * @param {string} term
 * @returns {string}
 */
export function translateQuery(term) {
  if (!term || typeof term !== 'string') return '';
  const normalized = term.trim().toLowerCase();
  return Object.hasOwn(PORTUGUESE_TERMS_MAP, normalized) ? PORTUGUESE_TERMS_MAP[normalized] : normalized;
}

/**
 * Resolve o termo de busca para inglês:
 * 1. Primeiro verifica o mapa estático em português (instantâneo).
 * 2. Caso não esteja no mapa, traduz dinamicamente pt-BR -> en via MyMemory API.
 * @param {string} term
 * @returns {Promise<string>}
 */
export async function resolveSearchTerm(term) {
  if (!term || typeof term !== 'string') return '';
  const normalized = term.trim().toLowerCase();

  if (Object.hasOwn(PORTUGUESE_TERMS_MAP, normalized)) {
    return PORTUGUESE_TERMS_MAP[normalized];
  }

  return translateText(normalized, RECIPE_LANGUAGE, 'en');
}

/**
 * Busca receitas na TheMealDB por nome e traduz os títulos retornados para português.
 * 
 * @param {string} query - Termo de busca (em português ou inglês)
 * @returns {Promise<Array<{ id: string, name: string, imageUrl: string }>>}
 */
export async function searchRecipes(query) {
  const searchTerm = await resolveSearchTerm(query);

  if (!searchTerm) {
    return [];
  }

  const encodedTerm = encodeURIComponent(searchTerm);
  const response = await fetch(`${BASE_URL}${encodedTerm}`);

  if (!response.ok) {
    throw new Error(`Falha na requisição da API (HTTP ${response.status})`);
  }

  const data = await response.json();

  // A TheMealDB retorna { meals: null } quando nenhuma receita é encontrada
  if (data?.meals === null) {
    return [];
  }

  if (!Array.isArray(data?.meals)) {
    throw new Error('Resposta inválida da API de receitas.');
  }

  const names = await translateRecipeTitles(data.meals.map((meal) => meal.strMeal));
  return data.meals.map((meal, index) => ({
    id: meal.idMeal,
    name: names[index] || meal.strMeal,
    imageUrl: meal.strMealThumb,
  }));
}
