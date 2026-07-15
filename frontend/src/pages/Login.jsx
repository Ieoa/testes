import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { const data = await api('/users/login', { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); navigate('/feed'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="brand-panel"><div className="logo">𝕏</div><h1>O que está acontecendo agora</h1><p>Entre na conversa. Compartilhe ideias em até 280 caracteres.</p></section><section className="auth-card"><span className="eyebrow">BEM-VINDO DE VOLTA</span><h2>Entre na sua conta</h2><form onSubmit={submit}><label>Usuário<input required autoFocus value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="seu_usuario" /></label><label>Senha<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label>{error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button></form><p className="switch">Ainda não tem conta? <Link to="/register">Criar conta</Link></p></section></main>;
}
