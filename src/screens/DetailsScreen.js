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
import { RECIPE_LANGUAGE, recipeMessages } from '../i18n/recipeLocale';
import { getRecipeById } from '../services/getRecipeById';
import { translateRecipe } from '../services/translateRecipe';
import { colors } from '../theme';

const messages = recipeMessages[RECIPE_LANGUAGE];

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
    return <RecipeLoading message={messages.loading} />;
  }

  if (error) {
    return (
      <View style={styles.feedbackCard}>
        <Text accessibilityRole="alert" style={styles.errorTitle}>
          {messages.loadError}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={messages.retry}
          onPress={retry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryButtonText}>{messages.retry}</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.feedbackCard}>
        <Text accessibilityRole="header" style={styles.emptyTitle}>
          {messages.notFound}
        </Text>
      </View>
    );
  }

  return <LocalizedRecipe recipe={recipe} />;
}

function RecipeLoading({ message }) {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
    </View>
  );
}

function LocalizedRecipe({ recipe }) {
  const [translation, setTranslation] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function localize() {
      let result;
      try {
        result = await translateRecipe(recipe, { signal: controller.signal });
      } catch {
        result = { recipe, usedOriginal: true };
      }
      if (!controller.signal.aborted) setTranslation(result);
    }

    localize();
    return () => controller.abort();
  }, [recipe]);

  if (!translation) {
    return <RecipeLoading message={messages.translating} />;
  }

  const imageUrl = typeof recipe.imageUrl === 'string' ? recipe.imageUrl.trim() : '';
  const showImage = !imageFailed && /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#]\S*)?$/i.test(imageUrl);

  const displayRecipe = translation.recipe ?? recipe;
  const isPartialTranslation = translation.usedOriginal && (
    displayRecipe.name !== recipe.name ||
    displayRecipe.instructions !== recipe.instructions ||
    (Array.isArray(displayRecipe.ingredients) && displayRecipe.ingredients.some((ingredient, index) => {
      const originalIngredient = recipe.ingredients?.[index];
      return ingredient?.name !== originalIngredient?.name || ingredient?.measure !== originalIngredient?.measure;
    }))
  );
  const instructions = typeof displayRecipe.instructions === 'string' ? displayRecipe.instructions : '';
  const ingredients = Array.isArray(displayRecipe.ingredients)
    ? displayRecipe.ingredients.filter((ingredient) => typeof ingredient?.name === 'string' && ingredient.name.trim())
    : [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.detailsContent}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          {displayRecipe.name}
        </Text>
        {/* Conectar ao FavoritesContext quando disponível, usando recipe.id, recipe.name e recipe.imageUrl. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Favoritar receita"
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.favoriteButton}
        >
          <Text accessible={false} allowFontScaling={false} style={styles.favoriteIcon}>
            ♡
          </Text>
        </Pressable>
      </View>
      {translation.usedOriginal && (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {isPartialTranslation
            ? 'Tradução parcial. Alguns trechos estão no idioma original.'
            : messages.translationUnavailable}
        </Text>
      )}
      <View style={styles.imageFrame}>
        {showImage ? (
          <Image
            accessible
            accessibilityRole="image"
            accessibilityLabel={messages.imageLabel(displayRecipe.name)}
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>{messages.imageUnavailable}</Text>
          </View>
        )}
      </View>
      <View style={styles.detailSection}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {messages.ingredients}
        </Text>
        {ingredients.length === 0 ? (
          <Text style={styles.message}>{messages.ingredientsUnavailable}</Text>
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
      <View style={styles.detailSection}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {messages.instructions}
        </Text>
        {instructions.trim() ? (
          <Text style={styles.instructionsText}>{instructions}</Text>
        ) : (
          <Text style={styles.message}>{messages.instructionsUnavailable}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
  },
  favoriteIcon: {
    color: colors.muted,
    fontSize: 26,
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
  detailSection: {
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
  instructionsText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
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
