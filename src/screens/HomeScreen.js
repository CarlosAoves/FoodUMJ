import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Screen from '../components/Screen';
import { colors } from '../theme';

const suggestions = [
  { label: 'Frango', query: 'chicken' },
  { label: 'Macarrão', query: 'pasta' },
  { label: 'Sopa', query: 'soup' },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [hasError, setHasError] = useState(false);

  function openResults(value) {
    const displayQuery = value.trim();

    if (!displayQuery) {
      setHasError(true);
      return;
    }

    const normalizedQuery = displayQuery.toLowerCase();
    const suggestion = suggestions.find(({ label }) => label.toLowerCase() === normalizedQuery);

    setSearch(displayQuery);
    setHasError(false);
    Keyboard.dismiss();
    navigation.navigate('Results', { query: suggestion?.query ?? displayQuery, displayQuery });
  }

  function updateSearch(value) {
    setSearch(value);
    setHasError(false);
  }

  function openFavorites() {
    Keyboard.dismiss();
    navigation.navigate('Favorites');
  }

  return (
    <Screen>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>RECEITAS</Text>
          <Text accessibilityRole="header" style={styles.title}>
            O que vamos cozinhar hoje?
          </Text>
          <Text style={styles.intro}>Encontre ideias para a sua próxima refeição.</Text>
        </View>

        <View style={styles.searchCard}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Buscar receita</Text>
          <Text style={styles.hint}>Digite o nome de um prato ou escolha uma sugestão.</Text>
          <TextInput
            accessibilityLabel="Nome da receita"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, hasError && styles.inputError]}
            placeholder="Ex.: frango"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={updateSearch}
            returnKeyType="search"
            onSubmitEditing={() => openResults(search)}
          />
          {hasError && (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
              Digite o nome de uma receita para pesquisar.
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => openResults(search)}
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
          >
            <Text style={styles.searchButtonText}>Pesquisar</Text>
          </Pressable>
        </View>

        <View style={styles.suggestions}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Sugestões de busca</Text>
          <View style={styles.chips}>
            {suggestions.map(({ label, query }) => (
              <Pressable
                key={query}
                accessibilityRole="button"
                accessibilityLabel={`Pesquisar ${label.toLowerCase()}`}
                onPress={() => openResults(label)}
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                <Text style={styles.chipText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver favoritas"
          onPress={openFavorites}
          style={({ pressed }) => [styles.favorites, pressed && styles.pressed]}
        >
          <View style={styles.favoritesCopy}>
            <Text style={styles.sectionTitle}>Ver favoritas</Text>
            <Text style={styles.hint}>Acesse as receitas que você salvou.</Text>
          </View>
          <Text accessible={false} style={styles.arrow}>›</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 4,
  },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: 22,
    padding: 24,
    gap: 8,
  },
  eyebrow: {
    color: colors.heroAccent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '800',
  },
  intro: {
    color: colors.tint,
    fontSize: 16,
    lineHeight: 23,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    padding: 10,
  },
  searchButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  suggestions: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.tint,
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  favorites: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  favoritesCopy: {
    flex: 1,
    gap: 4,
  },
  arrow: {
    color: colors.primary,
    fontSize: 28,
  },
  pressed: {
    opacity: 0.75,
  },
});
