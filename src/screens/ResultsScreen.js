import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import RecipeCard from '../components/RecipeCard';
import Screen from '../components/Screen';
import { searchRecipes } from '../services/searchRecipes';
import { colors } from '../theme';

export default function ResultsScreen({ navigation, route }) {
  const { query, displayQuery = query } = route.params ?? {};

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadRecipes() {
    try {
      setLoading(true);
      setError(null);
      const results = await searchRecipes(query);
      setRecipes(results);
    } catch (err) {
      setError('Não foi possível carregar as receitas. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, [query]);

  function handleSelectRecipe(recipe) {
    navigation.navigate('Details', { id: recipe.id });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>RESULTADOS</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {displayQuery}
        </Text>
        {!loading && !error && recipes.length > 0 && (
          <Text style={styles.countText}>
            {recipes.length} {recipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
          </Text>
        )}
      </View>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Buscando receitas saborosas...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.feedbackCard}>
          <Text accessibilityRole="alert" style={styles.errorTitle}>
            Ops! Ocorreu um problema
          </Text>
          <Text style={styles.feedbackMessage}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            onPress={loadRecipes}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && recipes.length === 0 && (
        <View style={styles.feedbackCard}>
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Nenhuma receita encontrada
          </Text>
          <Text style={styles.feedbackMessage}>
            Não encontramos receitas para "{displayQuery}". Tente pesquisar por termos como frango,
            macarrão, carne, bolo ou sopa.
          </Text>
        </View>
      )}

      {!loading && !error && recipes.length > 0 && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleSelectRecipe(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    gap: 4,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  countText: {
    color: colors.muted,
    fontSize: 14,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackMessage: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.75,
  },
});
