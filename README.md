# FoodUMJ

Aplicativo de receitas em React Native com Expo para o trabalho final de Programação em Dispositivos Móveis.

## Rodar no celular

Com o Node.js 24 LTS e o Expo Go compatível com o SDK 58, rode na pasta do projeto:

```bash
npm ci
npm start
```

Conecte o celular e o computador à mesma rede. No Android, abra o Expo Go e escaneie o QR code exibido no terminal. No iPhone, escaneie com a Câmera e toque para abrir no Expo Go. [Guia do Expo](https://docs.expo.dev/get-started/start-developing/)

## O que já está pronto

A tela inicial e a navegação já estão prontas. O campo guarda o texto com `useState` e avisa quando a pessoa tenta pesquisar sem digitar um nome. Dá para pesquisar pelo botão, pelo teclado ou pelas sugestões em português. O estilo das telas está em `src/theme.js` e as rotas ficam em `App.js`.

Na versão atual, toque em **Frango** para abrir os resultados e depois em **Abrir detalhe de exemplo** para ver a tela que recebe o ID da receita. O atalho **Ver favoritas** abre a quarta tela. Resultados, detalhes e favoritas ainda exibem conteúdo provisório.

## O que falta por integrante

### Integrante 2 — Busca na API e tela de resultados

Edite `src/screens/ResultsScreen.js` e crie `src/services/searchRecipes.js`.

- [ ] Implemente `searchRecipes(query)` para buscar pelo nome na TheMealDB. Codifique o termo com `encodeURIComponent`, confira o status HTTP e transforme `meals: null` em uma lista vazia. Converta cada receita para `{ id, name, imageUrl }` usando `idMeal`, `strMeal` e `strMealThumb`.
- [ ] Use `useState` para guardar os resultados e controlar carregamento e erro. Mostre uma indicação durante a consulta, uma mensagem quando a busca voltar vazia e **Tentar novamente** quando a consulta falhar.
- [ ] Mantenha `displayQuery` como o texto mostrado na tela. A tela inicial já converte **Frango**, **Macarrão** e **Sopa** para os termos do catálogo. Defina no serviço como tratar outros termos em português e documente os termos atendidos caso use um mapeamento.
- [ ] Substitua o botão de exemplo por uma lista com nome e imagem. Ao tocar em uma receita, abra `Details` com `{ id: recipe.id }`.

Para testar, pesquise `frango` e abra uma das receitas da lista. Faça uma busca sem correspondência e simule uma falha de conexão para conferir se o aplicativo mostra a mensagem certa em cada caso.

### Integrante 3 — Consulta por ID e tela de detalhes

Edite `src/screens/DetailsScreen.js` e crie `src/services/getRecipeById.js`.

- [ ] Implemente `getRecipeById(id)` para consultar a TheMealDB pelo ID recebido em `route.params`. Confira o status HTTP e trate receita indisponível quando a resposta vier sem um item.
- [ ] Mostre nome, foto, ingredientes com as medidas disponíveis e modo de preparo em uma tela rolável. A API fornece ingredientes e medidas em pares numerados, como `strIngredient1` e `strMeasure1`. Ignore os pares em que o ingrediente estiver vazio.
- [ ] Use `useState` para os dados e os estados da consulta. Mostre carregamento, erro com opção de tentar novamente e uma mensagem quando a receita não for encontrada.
- [ ] Com o contexto do integrante 4 disponível, use `isFavorite(id)` para exibir **Adicionar às favoritas** ou **Remover das favoritas**. Chame `toggleFavorite({ id, name, imageUrl })` ao tocar no botão.

Enquanto a lista real estiver em desenvolvimento, use **Abrir detalhe de exemplo** para testar a receita de ID `52772`. Depois que o contexto estiver integrado, teste adicionar e remover a receita pela tela de detalhes.

### Integrante 4 — Contexto e tela de favoritas

Crie `src/context/FavoritesContext.js` e edite `src/screens/FavoritesScreen.js`.

- [ ] Crie `FavoritesProvider` com uma lista inicialmente vazia em `useState` e exponha `useFavorites()` com `useContext`. O hook deve retornar `favorites`, `isFavorite(id)` e `toggleFavorite(recipe)`.
- [ ] Em `toggleFavorite`, atualize a lista anterior pelo ID. Se o ID já estiver na lista, remova o item. Se for novo, adicione o resumo da receita. O estado fica no provider durante a sessão do app.
- [ ] Mostre um estado vazio e uma lista com nome e imagem das receitas salvas. Permita abrir `Details` com `{ id: recipe.id }` e remover uma receita diretamente da lista.
- [ ] Combine com o integrante 1 a inclusão de `FavoritesProvider` em `App.js`, envolvendo as quatro telas. Avise o integrante 3 assim que o hook e o provider estiverem disponíveis para a integração.

Adicione uma receita pela tela de detalhes e confira se ela aparece uma única vez em **Ver favoritas**. Abra a receita pela lista e volte para removê-la. Ao abrir os detalhes de novo pelos resultados, o botão deve voltar a mostrar **Adicionar às favoritas**.

## Acordos de integração

- `Results` recebe `{ query, displayQuery }`. Use `query` para a consulta e `displayQuery` na interface. `Details` recebe `{ id }` como texto.
- O resumo compartilhado entre as telas é `{ id, name, imageUrl }`. O detalhe acrescenta `ingredients` (lista de `{ name, measure }`) e `instructions` (texto do preparo).
- Usem `src/components/Screen.js` e as cores de `src/theme.js` como base para as telas. Escrevam títulos, botões e mensagens de estado em português.
- A API proposta é a [TheMealDB](https://www.themealdb.com/docs_api_guide.php), com a chave de teste pública `1` para uso acadêmico.

| Operação | Exemplo de chamada |
| --- | --- |
| Buscar pelo nome | `https://www.themealdb.com/api/json/v1/1/search.php?s=chicken` |
| Consultar pelo ID | `https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772` |

## Teste final e entrega

1. Cada integrante trabalha em sua branch, registra commits próprios e integra sua parte à `main`.
2. O integrante 1 revisa a navegação e a inclusão do provider com o integrante 4. O grupo testa no celular o caminho **Pesquisar → Resultados → Detalhes → Favoritar → Ver favoritas → Reabrir → Remover**. Confiram também o carregamento, uma busca sem resultados, a mensagem de falha de conexão e a opção de tentar novamente.
3. Confirmem que o repositório do GitHub está público, contém o código-fonte completo e mostra commits dos quatro integrantes. Entreguem o link do repositório.
4. Na apresentação, cada integrante demonstra a própria contribuição e explica como ela se conecta ao restante do aplicativo.
