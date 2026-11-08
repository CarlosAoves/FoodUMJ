/**
 * Dicionário de termos comuns em português mapeados para o catálogo da TheMealDB.
 * Permite que o usuário pesquise ingredientes e pratos em português.
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
 * Traduz termos conhecidos em português ou retorna o termo original.
 * @param {string} term
 * @returns {string}
 */
export function translateQuery(term) {
  if (!term || typeof term !== 'string') return '';
  const normalized = term.trim().toLowerCase();
  return PORTUGUESE_TERMS_MAP[normalized] ?? normalized;
}

/**
 * Busca receitas na TheMealDB por nome.
 * 
 * @param {string} query - Termo de busca (em inglês ou português)
 * @returns {Promise<Array<{ id: string, name: string, imageUrl: string }>>}
 */
export async function searchRecipes(query) {
  const searchTerm = translateQuery(query);

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
  if (!data || !data.meals) {
    return [];
  }

  // Converte para o padrão de resumo acordado: { id, name, imageUrl }
  return data.meals.map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    imageUrl: meal.strMealThumb,
  }));
}
