const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

function trimText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Consulta uma receita pelo ID na TheMealDB.
 * @param {string} id
 * @returns {Promise<{
 *   id: string,
 *   name: string,
 *   imageUrl: string,
 *   ingredients: Array<{ name: string, measure: string }>,
 *   instructions: string
 * } | null>}
 */
export async function getRecipeById(id) {
  const recipeId = typeof id === 'string' ? id.trim() : '';
  if (!/^\d+$/.test(recipeId)) {
    throw new TypeError('Informe um ID de receita válido.');
  }

  const response = await fetch(`${BASE_URL}${encodeURIComponent(recipeId)}`);
  if (!response.ok) {
    throw new Error(`Falha na requisição da API (HTTP ${response.status})`);
  }

  const data = await response.json();
  const meals = data?.meals;
  if (meals === null || (Array.isArray(meals) && meals.length === 0)) {
    return null;
  }

  if (!Array.isArray(meals) || meals.length !== 1) {
    throw new Error('Resposta inválida da API de receitas.');
  }

  const meal = meals[0];
  if (
    meal?.idMeal !== recipeId ||
    typeof meal.strMeal !== 'string' ||
    !meal.strMeal.trim() ||
    typeof meal.strMealThumb !== 'string' ||
    !meal.strMealThumb.trim()
  ) {
    throw new Error('Dados inválidos na receita retornada pela API.');
  }

  const ingredients = [];
  for (let index = 1; index <= 20; index++) {
    const name = trimText(meal['strIngredient' + index]);
    if (name) {
      const measure = trimText(meal['strMeasure' + index]);
      ingredients.push({ name, measure });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    imageUrl: meal.strMealThumb,
    ingredients,
    instructions: trimText(meal.strInstructions),
  };
}
