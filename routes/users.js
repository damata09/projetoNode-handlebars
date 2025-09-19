const express = require('express');
const router = express.Router();
const { requireAuth } = require('./auth');
const { users, posts } = require('../data/storage');

// Perfil do usuário
router.get('/profile', requireAuth, (req, res) => {
  const userPosts = posts
    .filter(post => post.userId === req.session.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render('users/profile', { 
    user: req.session.user,
    posts: userPosts 
  });
});

// Página para editar perfil
router.get('/edit', requireAuth, (req, res) => {
  res.render('users/edit', { user: req.session.user });
});

// Atualizar perfil
router.put('/edit', requireAuth, (req, res) => {
  const { name, email, username } = req.body;
  const userId = req.session.user.id;

  if (!name || !email || !username) {
    req.flash('error_msg', 'Todos os campos são obrigatórios');
    return res.redirect('/users/edit');
  }

  // Verificar se email ou username já existem (exceto para o usuário atual)
  const existingUser = users.find(u => 
    (u.email === email || u.username === username) && u.id !== userId
  );
  
  if (existingUser) {
    req.flash('error_msg', 'Email ou nome de usuário já cadastrado');
    return res.redirect('/users/edit');
  }

  // Atualizar usuário
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].name = name;
    users[userIndex].email = email;
    users[userIndex].username = username;
    users[userIndex].updatedAt = new Date();

    // Atualizar sessão
    req.session.user = {
      ...req.session.user,
      name,
      email,
      username
    };

    req.flash('success_msg', 'Perfil atualizado com sucesso!');
    res.redirect('/users/profile');
  } else {
    req.flash('error_msg', 'Usuário não encontrado');
    res.redirect('/users/profile');
  }
});

// Listar todos os usuários (apenas para usuários logados)
router.get('/', requireAuth, (req, res) => {
  const usersList = users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    postCount: posts.filter(post => post.userId === user.id).length
  }));

  res.render('users/index', { users: usersList });
});

// Visualizar perfil de outro usuário
router.get('/:id', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    req.flash('error_msg', 'Usuário não encontrado');
    return res.redirect('/users');
  }

  const userPosts = posts
    .filter(post => post.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const userProfile = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    posts: userPosts
  };

  res.render('users/show', { 
    user: userProfile,
    isOwnProfile: user.id === req.session.user.id
  });
});

module.exports = router;
