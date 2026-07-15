const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'store.json');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

function readStore() {
  if (!fs.existsSync(dataFile)) return { users: [], posts: [] };
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeStore(store) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function publicUser(user) {
  return { id: user.id, name: user.name, username: user.username };
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Faça login para continuar.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sua sessão expirou. Entre novamente.' });
  }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/users/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase().replace(/^@/, '');
    const password = String(req.body.password || '');
    if (name.length < 2) return res.status(400).json({ error: 'Informe seu nome.' });
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return res.status(400).json({ error: 'O usuário deve ter de 3 a 20 letras, números ou _.' });
    if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    const store = readStore();
    if (store.users.some((user) => user.username === username)) return res.status(409).json({ error: 'Esse usuário já existe.' });
    const user = { id: Date.now(), name, username, password: await bcrypt.hash(password, 10) };
    store.users.push(user);
    writeStore(store);
    const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/users/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase().replace(/^@/, '');
    const store = readStore();
    const user = store.users.find((item) => item.username === username);
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/posts', auth, (req, res) => {
  const store = readStore();
  const posts = store.posts.map((post) => ({
    ...post,
    liked: post.likes.includes(req.user.id),
    likesCount: post.likes.length,
    canDelete: post.user.id === req.user.id,
    likes: undefined,
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

app.post('/api/posts', auth, (req, res) => {
  const content = String(req.body.content || '').trim();
  if (!content || content.length > 280) return res.status(400).json({ error: 'O post deve ter entre 1 e 280 caracteres.' });
  const store = readStore();
  const post = { id: Date.now(), content, user: publicUser(req.user), createdAt: new Date().toISOString(), likes: [] };
  store.posts.push(post);
  writeStore(store);
  res.status(201).json({ ...post, liked: false, likesCount: 0, canDelete: true, likes: undefined });
});

app.post('/api/posts/:id/like', auth, (req, res) => {
  const store = readStore();
  const post = store.posts.find((item) => item.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post não encontrado.' });
  const index = post.likes.indexOf(req.user.id);
  if (index >= 0) post.likes.splice(index, 1); else post.likes.push(req.user.id);
  writeStore(store);
  res.json({ liked: index < 0, likesCount: post.likes.length });
});

app.delete('/api/posts/:id', auth, (req, res) => {
  const store = readStore();
  const index = store.posts.findIndex((item) => item.id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ error: 'Post não encontrado.' });
  if (store.posts[index].user.id !== req.user.id) return res.status(403).json({ error: 'Você não pode apagar este post.' });
  store.posts.splice(index, 1);
  writeStore(store);
  res.status(204).end();
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
});

if (require.main === module) app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
module.exports = app;
