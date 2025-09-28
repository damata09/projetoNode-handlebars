const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('./auth');
const { users, posts } = require('../data/storage');
const upload = require('../config/upload');

// Perfil do usuário
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await users.findById(req.session.user.id);
    const userPosts = await posts.findAll({ 
      userId: req.session.user.id,
      isPublished: true 
    });

    // Calcular estatísticas
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalPosts = userPosts.length;

    res.render('users/profile', { 
      user,
      posts: userPosts,
      stats: {
        totalViews,
        totalLikes,
        totalPosts,
        points: user.points || 0
      }
    });
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    req.flash('error_msg', 'Erro ao carregar perfil');
    res.redirect('/');
  }
});

// Página para editar perfil
router.get('/edit', requireAuth, async (req, res) => {
  try {
    const user = await users.findById(req.session.user.id);
    res.render('users/edit', { user });
  } catch (error) {
    console.error('Erro ao carregar perfil para edição:', error);
    req.flash('error_msg', 'Erro ao carregar perfil');
    res.redirect('/users/profile');
  }
});

// Atualizar perfil
router.put('/edit', requireAuth, async (req, res) => {
  try {
    const { name, email, username, bio, github, linkedin } = req.body;
    const userId = req.session.user.id;

    if (!name || !email || !username) {
      req.flash('error_msg', 'Nome, email e username são obrigatórios');
      return res.redirect('/users/edit');
    }

    // Verificar se email ou username já existem (exceto para o usuário atual)
    const existingUser = await users.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      req.flash('error_msg', 'Email já cadastrado');
      return res.redirect('/users/edit');
    }

    // Atualizar usuário
    const updatedUser = await users.update(userId, {
      name,
      email,
      username,
      bio: bio || null,
      github: github || null,
      linkedin: linkedin || null
    });

    // Atualizar sessão
    req.session.user = {
      ...req.session.user,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username
    };

    req.flash('success_msg', 'Perfil atualizado com sucesso!');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    req.flash('error_msg', 'Erro ao atualizar perfil');
    res.redirect('/users/edit');
  }
});

// Upload de avatar
router.post('/upload-avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'Nenhuma imagem foi selecionada');
      return res.redirect('/users/edit');
    }

    const userId = req.session.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Atualizar avatar no banco de dados
    await users.update(userId, { avatar: avatarPath });

    // Atualizar sessão
    req.session.user.avatar = avatarPath;

    req.flash('success_msg', 'Foto de perfil atualizada com sucesso!');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    req.flash('error_msg', 'Erro ao fazer upload da foto');
    res.redirect('/users/edit');
  }
});

// Listar todos os usuários (apenas para usuários logados)
router.get('/', requireAuth, async (req, res) => {
  try {
    const usersList = await users.findAll();
    res.render('users/index', { users: usersList, user: req.session.user });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    req.flash('error_msg', 'Erro ao carregar usuários');
    res.render('users/index', { users: [], user: req.session.user });
  }
});

// Visualizar perfil de outro usuário
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = await users.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Usuário não encontrado');
      return res.redirect('/users');
    }

    const userPosts = await posts.findAll({ 
      userId: user.id,
      isPublished: true 
    });

    res.render('users/show', { 
      user,
      posts: userPosts,
      isOwnProfile: user.id === req.session.user.id
    });
  } catch (error) {
    console.error('Erro ao carregar perfil do usuário:', error);
    req.flash('error_msg', 'Erro ao carregar perfil');
    res.redirect('/users');
  }
});

module.exports = router;
