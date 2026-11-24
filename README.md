# FoodUMJ

## 1. Sobre o projeto

O FoodUMJ é um aplicativo de receitas desenvolvido como trabalho da disciplina de Programação em Dispositivos Móveis, no curso de Análise e Desenvolvimento de Sistemas.
O objetivo é permitir que o usuário pesquise pratos, consulte os detalhes e organize suas receitas favoritas.

## 2. Funcionalidades

- Pesquisa por nome, com termos em português e sugestões de busca.
- Resultados com nome e imagem das receitas.
- Detalhes com ingredientes, quantidades e modo de preparo.
- Tradução automática para português, mantendo o texto original nos trechos em que a tradução falhar.
- Adição e remoção de favoritos, com atualização do coração e da lista.
- Abertura dos detalhes pela lista de favoritos.
- Indicadores de carregamento, mensagens de erro e opção de tentar novamente.

Os favoritos ficam disponíveis durante a sessão. Ao reiniciar ou recarregar o aplicativo, a lista é apagada.

## 3. Tecnologias utilizadas

- **React Native 0.88.1 e React 19.3.0** — interface e gerenciamento de estados.
- **Expo SDK 58** — desenvolvimento e execução pelo Expo Go.
- **JavaScript** — linguagem utilizada no projeto.
- **React Navigation** — navegação entre as quatro telas.
- **Context API** — compartilhamento dos favoritos entre telas.
- **React Native Safe Area Context** — adaptação à área segura do celular.
- **TheMealDB** — consulta de receitas e imagens.
- **MyMemory** — tradução dos textos das receitas.

## 4. Como executar o projeto

### Passo 1 — Preparar o computador

Instale o **Node.js 24 LTS** pelo [site oficial](https://nodejs.org/en/download), escolhendo a versão para seu sistema.
Mantenha a instalação do npm, que acompanha o Node.js. Instale também o [Git](https://git-scm.com/downloads).
Depois da instalação, abra um novo terminal e confira se os comandos estão disponíveis.

```bash
node --version
npm --version
git --version
```

### Passo 2 — Instalar o Expo Go

No celular, instale o **Expo Go** pela Google Play ou App Store.
Use uma versão compatível com o **SDK 58**. As opções de instalação estão na [página do Expo Go](https://expo.dev/go).

### Passo 3 — Clonar e abrir a pasta

No terminal, execute os comandos abaixo.

```bash
git clone --branch main https://github.com/CarlosAoves/FoodUMJ.git
cd FoodUMJ
```

### Passo 4 — Instalar as dependências

Dentro da pasta do projeto, instale as versões registradas no arquivo de dependências.

```bash
npm ci
```

### Passo 5 — Iniciar a aplicação

```bash
npm start
```

Mantenha o terminal aberto enquanto testa o aplicativo. O Expo exibirá um QR Code.

### Passo 6 — Abrir no celular

Conecte o computador e o celular à **mesma rede Wi-Fi**.
No Android, abra o Expo Go e leia o QR Code. No iPhone, use a Câmera e abra o link no Expo Go.
No iPhone, entre com a mesma conta no Expo Go e no computador, usando `npx expo login` quando necessário.
Se o aplicativo não conectar, confira a rede e se o firewall permite o acesso ao servidor local. [Guia do Expo](https://docs.expo.dev/get-started/start-developing/)

Com o aplicativo aberto, pesquise uma receita, consulte os detalhes e toque no coração para adicioná-la aos favoritos.
As consultas e traduções precisam de acesso à internet.

## 5. Organização do projeto

```text
FoodUMJ/
├── App.js                   # Navegação e provider de favoritos
├── app.json                 # Configuração do Expo
├── package.json             # Scripts e dependências
├── package-lock.json        # Versões das dependências
└── src/
    ├── components/          # Screen e RecipeCard
    ├── context/             # FavoritesContext
    ├── i18n/                # Mensagens e idioma
    ├── screens/             # Home, Results, Details e Favorites
    ├── services/            # Consultas e tradução
    └── theme.js             # Cores da aplicação
```

## 6. Integrantes

| Integrante | Contribuição |
|---|---|
| [CarlosAoves](https://github.com/CarlosAoves) | Estrutura inicial, tela inicial, navegação e tema. |
| [eitor2006-svg](https://github.com/eitor2006-svg) | Busca na API, resultados e tradução inicial de termos e títulos. |
| [Maycon2222](https://github.com/Maycon2222) | Consulta por ID, tela de detalhes, consolidação da tradução e botão visual de favoritos. |
| [henrdev](https://github.com/henrdev) | Contexto, lista de favoritos e conexão funcional do coração com o contexto. |
