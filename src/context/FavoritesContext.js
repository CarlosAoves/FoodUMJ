import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
 
  const [favorites, setFavorites] = useState([]);

  
  function isFavorite(id) {
    return favorites.some(recipe => recipe.id === id);
  }


  function toggleFavorite(recipe) {
    setFavorites(atual => {
      
      if (atual.some(item => item.id === recipe.id)) {
        return atual.filter(item => item.id !== recipe.id); // Remove
      }
   
      return [...atual, { id: recipe.id, name: recipe.name, imageUrl: recipe.imageUrl }];
    });
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}