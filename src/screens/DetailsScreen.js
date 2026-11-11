import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Screen from '../components/Screen';
import { getRecipeById } from '../services/getRecipeById';
import { colors } from '../theme';

export default function DetailsScreen({ route }) {
  const id = route.params?.id;
  const trimmedId = typeof id === 'string' ? id.trim() : '';
  const recipeId = /^\d+$/.test(trimmedId) ? trimmedId : null;

  return (
    <Screen>
      <RecipeDetails key={recipeId} id={recipeId} />
    </Screen>
  );
}

function RecipeDetails({ id }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (id === null) return;

    let active = true;

    async function loadRecipe() {
      try {
        const result = await getRecipeById(id);
        if (active) setRecipe(result);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecipe();

    return () => {
      active = false;
    };
  }, [id, attempt]);

  function retry() {
    setLoading(true);
    setError(false);
    setAttempt((previousAttempt) => previousAttempt + 1);
  }

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          Carregando receita...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.feedbackCard}>
        <Text accessibilityRole="alert" style={styles.errorTitle}>
          Não foi possível carregar a receita.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          onPress={retry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.feedbackCard}>
        <Text accessibilityRole="header" style={styles.emptyTitle}>
          Receita não encontrada.
        </Text>
      </View>
    );
  }

  const imageUrl = typeof recipe.imageUrl === 'string' ? recipe.imageUrl.trim() : '';
  const showImage = !imageFailed && /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#]\S*)?$/i.test(imageUrl);

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.filter((ingredient) => typeof ingredient?.name === 'string' && ingredient.name.trim())
    : [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.detailsContent}>
      <Text accessibilityRole="header" style={styles.title}>
        {recipe.name}
      </Text>
      <View style={styles.imageFrame}>
        {showImage ? (
          <Image
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Foto de ${recipe.name}`}
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Imagem indisponível.</Text>
          </View>
        )}
      </View>
      <View style={styles.ingredientsSection}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Ingredientes
        </Text>
        {ingredients.length === 0 ? (
          <Text style={styles.message}>Ingredientes não disponíveis para esta receita.</Text>
        ) : (
          <View style={styles.ingredientList}>
            {ingredients.map(({ name, measure }, index) => (
              <View key={`${name}-${index}`} style={styles.ingredient}>
                <Text style={styles.ingredientName}>{name}</Text>
                {typeof measure === 'string' && measure.trim() !== '' && (
                  <Text style={styles.message}>{measure}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  detailsContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: 16,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.tint,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    color: colors.muted,
    textAlign: 'center',
  },
  ingredientsSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  ingredientList: {
    gap: 12,
  },
  ingredient: {
    gap: 2,
  },
  ingredientName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
  message: {
    color: colors.muted,
    fontSize: 15,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
