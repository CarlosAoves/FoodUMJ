import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import DetailsScreen from './src/screens/DetailsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'FoodUMJ' }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Receita' }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
