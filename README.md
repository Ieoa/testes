# Mini Twitter Clone

Mini rede social feita com React, Vite, Node.js e Express. Inclui cadastro e login com JWT, feed em tempo real, posts de até 280 caracteres, curtidas e exclusão dos próprios posts.

## Como executar

Requer Node.js 18 ou mais recente.

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
npm run dev
```

Abra `http://localhost:5173`. A API roda em `http://localhost:3000` e salva os dados localmente em `backend/data/store.json`.

Para produção, defina `JWT_SECRET`, `CLIENT_URL` e, no frontend, `VITE_API_URL`.
