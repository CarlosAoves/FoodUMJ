import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

/**
 * Card reutilizável para exibição resumida de receita ({ id, name, imageUrl }).
 * Utilizável na tela de Resultados (Integrante 2) e na tela de Favoritas (Integrante 4).
 */
export default function RecipeCard({ recipe, onPress, rightAction }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir receita ${recipe.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel={`Foto de ${recipe.name}`}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {recipe.name}
        </Text>
        <Text style={styles.actionText}>Ver receita ›</Text>
      </View>
      {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
    minHeight: 88,
  },
  image: {
    width: 88,
    height: '100%',
    backgroundColor: colors.tint,
  },
  info: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rightActionContainer: {
    paddingRight: 14,
  },
  pressed: {
    opacity: 0.8,
  },
});
