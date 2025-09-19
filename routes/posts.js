const express = require('express');
const router = express.Router();
const { requireAuth } = require('./auth');
const { users, posts } = require('../data/storage');

// Listar todas as postagens
router.get('/', (req, res) => {
  const postsWithUsers = posts.map(post => {
    const user = users.find(u => u.id === post.userId);
    return {
      ...post,
      user: user ? { name: user.name, username: user.username } : null
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render('posts/index', { posts: postsWithUsers });
});

// Página para criar nova postagem
router.get('/create', requireAuth, (req, res) => {
  res.render('posts/create');
});

// Criar nova postagem
router.post('/create', requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    req.flash('error_msg', 'Título e conteúdo são obrigatórios');
    return res.redirect('/posts/create');
  }

  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    userId: req.session.user.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  posts.push(newPost);
  req.flash('success_msg', 'Postagem criada com sucesso!');
  res.redirect('/posts');
});

// Visualizar postagem individual
router.get('/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    req.flash('error_msg', 'Postagem não encontrada');
    return res.redirect('/posts');
  }

  const user = users.find(u => u.id === post.userId);
  const postWithUser = {
    ...post,
    user: user ? { name: user.name, username: user.username } : null
  };

  res.render('posts/show', { post: postWithUser });
});

// Página para editar postagem
router.get('/:id/edit', requireAuth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    req.flash('error_msg', 'Postagem não encontrada');
    return res.redirect('/posts');
  }

  // Verificar se o usuário é o dono da postagem
  if (post.userId !== req.session.user.id) {
    req.flash('error_msg', 'Você não tem permissão para editar esta postagem');
    return res.redirect('/posts');
  }

  res.render('posts/edit', { post });
});

// Atualizar postagem
router.put('/:id', requireAuth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    req.flash('error_msg', 'Postagem não encontrada');
    return res.redirect('/posts');
  }

  // Verificar se o usuário é o dono da postagem
  if (post.userId !== req.session.user.id) {
    req.flash('error_msg', 'Você não tem permissão para editar esta postagem');
    return res.redirect('/posts');
  }

  const { title, content } = req.body;

  if (!title || !content) {
    req.flash('error_msg', 'Título e conteúdo são obrigatórios');
    return res.redirect(`/posts/${post.id}/edit`);
  }

  post.title = title;
  post.content = content;
  post.updatedAt = new Date();

  req.flash('success_msg', 'Postagem atualizada com sucesso!');
  res.redirect(`/posts/${post.id}`);
});

// Deletar postagem
router.delete('/:id', requireAuth, (req, res) => {
  const postIndex = posts.findIndex(p => p.id === req.params.id);
  
  if (postIndex === -1) {
    req.flash('error_msg', 'Postagem não encontrada');
    return res.redirect('/posts');
  }

  const post = posts[postIndex];

  // Verificar se o usuário é o dono da postagem
  if (post.userId !== req.session.user.id) {
    req.flash('error_msg', 'Você não tem permissão para deletar esta postagem');
    return res.redirect('/posts');
  }

  posts.splice(postIndex, 1);
  req.flash('success_msg', 'Postagem deletada com sucesso!');
  res.redirect('/posts');
});

module.exports = router;
