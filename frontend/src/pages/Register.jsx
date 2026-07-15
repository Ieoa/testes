import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  async function submit(event) { event.preventDefault(); setError(''); setLoading(true); try { const data = await api('/users/register', { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); navigate('/feed'); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  return <main className="auth-page"><section className="brand-panel"><div className="logo">𝕏</div><h1>Faça parte da conversa</h1><p>Crie sua conta e publique seu primeiro post em poucos segundos.</p></section><section className="auth-card"><span className="eyebrow">COMECE AGORA</span><h2>Crie sua conta</h2><form onSubmit={submit}><label>Nome<input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" /></label><label>Usuário<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="seu_usuario" /></label><label>Senha<input required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo de 6 caracteres" /></label>{error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? 'Criando…' : 'Criar conta'}</button></form><p className="switch">Já possui conta? <Link to="/login">Entrar</Link></p></section></main>;
}
