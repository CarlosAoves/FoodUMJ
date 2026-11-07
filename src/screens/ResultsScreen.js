import { Button, Text } from 'react-native';

import Screen from '../components/Screen';
import { colors } from '../theme';

export default function ResultsScreen({ navigation, route }) {
  const { query, displayQuery = query } = route.params;

  return (
    <Screen>
      <Text>Termo pesquisado: {displayQuery}</Text>
      <Text>A lista de receitas será exibida aqui após a integração com a API.</Text>
      <Button
        title="Abrir detalhe de exemplo"
        color={colors.primary}
        onPress={() => navigation.navigate('Details', { id: '52772' })}
      />
    </Screen>
  );
}
