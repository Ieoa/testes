import { api } from '../services/api';

export default function PostCard({ post, onUpdate, onDelete }) {
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(post.createdAt));
  async function like() { const result = await api(`/posts/${post.id}/like`, { method: 'POST' }); onUpdate({ ...post, ...result }); }
  async function remove() { if (confirm('Apagar este post?')) { await api(`/posts/${post.id}`, { method: 'DELETE' }); onDelete(post.id); } }
  return <article className="post"><div className="avatar">{post.user.name[0].toUpperCase()}</div><div className="post-body"><div className="post-meta"><strong>{post.user.name}</strong><span>@{post.user.username} · {date}</span>{post.canDelete && <button className="delete" onClick={remove} title="Apagar">×</button>}</div><p>{post.content}</p><div className="post-actions"><button title="Comentar">◯ <span>0</span></button><button title="Repostar">⇄ <span>0</span></button><button className={post.liked ? 'liked' : ''} onClick={like} title="Curtir">{post.liked ? '♥' : '♡'} <span>{post.likesCount}</span></button><button title="Compartilhar">⌃</button></div></div></article>;
}
