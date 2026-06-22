# ✅ Checklist Pré-Execução

Antes de rodar os terminais, confirme isso tudo:

## Backend (ecommerce-fullstack/backend)

- [ ] `.env` existe e tem `JWT_SECRET` configurado
- [ ] `DB_URL` aponta para seu PostgreSQL rodando
- [ ] `npm install` já foi executado
- [ ] Rodas: `npm run dev` (deve listar todas as rotas: users, products, cart, orders, dashboard)

## Frontend Web (ecommerce-fullstack/frontend) - Opcional

- [ ] `npm install` já foi executado
- [ ] Rodas: `npm run dev`

## Mobile App (ecommerce-mobile-app)

- [ ] `.env` criado com `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
  - Se device físico: use IP local tipo `http://192.168.0.10:3000/api`
- [ ] `npm install` já foi executado (✅ FEITO)
- [ ] Expo CLI instalado: `npm install -g expo-cli`

## Emulador/Device

**Android:**
- [ ] Android Studio instalado
- [ ] Emulador criado e inicia com: Android Studio > AVD Manager > Launch

**iOS (sem Windows):**
- [ ] Expo Go instalado no iPhone
- [ ] iPhone na mesma rede do PC

## Teste de Conectividade

1. Backend rodando?
   ```bash
   curl http://localhost:3000/api/products
   ```
   Deve retornar um array JSON.

2. Pode alcançar o backend do seu device?
   - Android Emulator: `localhost:3000` = da máquina host
   - Device físico: Mude .env para IP local e confirme ping

## Fluxo de Teste

1. Abra o app
2. Login com `admin@email.com` / `123456`
3. Veja lista de produtos (deve vir do backend)
4. Clique em um produto
5. Adicione ao carrinho
6. Veja carrinho (deve sincronizar)
7. Logout

Se tudo rodar sem erro de conexão, **está pronto para produção!**
