import { Text } from 'react-native';

import Screen from '../components/Screen';

export default function DetailsScreen({ route }) {
  const { id } = route.params;

  return (
    <Screen>
      <Text>Receita de exemplo • ID {id}</Text>
      <Text>A foto, os ingredientes, o modo de preparo e o botão de favoritar ficarão nesta tela.</Text>
    </Screen>
  );
}
