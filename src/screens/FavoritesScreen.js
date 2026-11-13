import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Screen from '../components/Screen'; 
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não possui receitas favoritas.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardInfo}
              onPress={() => navigation.navigate('Details', { id: item.id })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.removeButton}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, marginBottom: 12, borderRadius: 8, elevation: 1 },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#E2E8F0' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  removeButton: { padding: 8 },
  removeText: { color: '#DC2626', fontWeight: 'bold' }
});