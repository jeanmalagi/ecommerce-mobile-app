# Ecommerce Mobile App

Aplicativo mobile baseado na mesma logica do projeto ecommerce-fullstack.

## Stack

- Expo + React Native + TypeScript
- React Navigation (Stack + Tabs)
- Axios
- AsyncStorage
- TanStack Query

## Estrutura

- src/api: cliente HTTP e interceptor de token
- src/services: auth, products, cart, orders
- src/context: sessao e autenticacao
- src/navigation: guards por perfil (cliente/admin)
- src/screens: telas iniciais do fluxo

## Endpoints esperados

- POST /users/login
- POST /users/register
- GET /products
- GET /products/:id
- GET /cart
- POST /cart
- PUT /cart/:id
- DELETE /cart/:id
- GET /orders (se o backend expor)

A URL base eh lida de EXPO_PUBLIC_API_URL, por exemplo:

EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api

## Como rodar

### Pré-requisitos

- Node.js 18+
- Backend (ecommerce-fullstack) rodando em http://localhost:3000
- Android Studio com emulador configurado (para Android)
- Expo CLI: npm install -g expo-cli

### Passos

1. Entre na pasta do app:

```bash
cd ecommerce-mobile-app
```

2. Dependências já instaladas, mas se precisar reinstalar:

```bash
npm install
```

3. Confirme o .env está configurado (já criado com URL localhost):

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Se rodar em device físico na rede local, altere para:

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api
```

(Substitua 192.168.0.10 pelo IP da máquina que está rodando o backend)

4. **Certifique-se de que o backend está rodando** (em outro terminal):

```bash
cd ecommerce-fullstack/backend
npm run dev
```

5. Inicie o Expo:

```bash
npm run start
```

6. Execute no Android (emulador ou device):

```bash
npm run android
```

7. Ou use Expo Go (mais rápido):
   - Abra o app Expo Go no seu dispositivo
   - Escaneie o QR code exibido no terminal
   - App carrega diretamente no seu celular

### Contas teste

- Email: `admin@email.com` | Senha: `123456` (admin)
- Email: `cliente@email.com` | Senha: `123456` (cliente)

## iOS

O projeto tambem roda no iOS.

- Em Windows, voce nao compila binario iOS localmente.
- Voce pode testar com Expo Go em um iPhone na mesma rede (abrindo o QR no app Expo Go).
- Para build de distribuicao iOS, use EAS Build (nuvem) ou uma maquina macOS.

## Observacoes de compatibilidade com backend atual

- Este app ja usa controle de perfil por user.is_admin.
- Se a rota /api/orders ainda nao estiver registrada no backend, a tela de pedidos vai avisar.
- Produtos sem imagem devem usar fallback no backend para evitar itens quebrados no app.
