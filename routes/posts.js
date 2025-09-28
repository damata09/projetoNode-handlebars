const express = require('express');
const router = express.Router();
const { requireAuth } = require('./auth');
const { users, posts } = require('../data/storage');

// Listar todas as postagens
router.get('/', async (req, res) => {
  try {
    const allPosts = await posts.findAll({ isPublished: true });
    res.render('posts/index', { posts: allPosts, user: req.session.user });
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    req.flash('error_msg', 'Erro ao carregar postagens');
    res.render('posts/index', { posts: [], user: req.session.user });
  }
});

// Página para criar nova postagem
router.get('/create', requireAuth, (req, res) => {
  res.render('posts/create');
});

// Criar nova postagem
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      req.flash('error_msg', 'Título e conteúdo são obrigatórios');
      return res.redirect('/posts/create');
    }

    const newPost = await posts.create({
      title,
      content,
      category: category || 'geral',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      userId: req.session.user.id,
      isPublished: true
    });

    // Adicionar pontos ao usuário
    await users.addPoints(req.session.user.id, 10);

    req.flash('success_msg', 'Postagem criada com sucesso! Você ganhou 10 pontos!');
    res.redirect('/posts');
  } catch (error) {
    console.error('Erro ao criar post:', error);
    req.flash('error_msg', 'Erro ao criar postagem');
    res.redirect('/posts/create');
  }
});

// Visualizar postagem individual
router.get('/:id', async (req, res) => {
  try {
    const post = await posts.findById(req.params.id);
    
    if (!post) {
      req.flash('error_msg', 'Postagem não encontrada');
      return res.redirect('/posts');
    }

    // Incrementar visualizações
    await posts.incrementViews(post.id);

    res.render('posts/show', { post, user: req.session.user });
  } catch (error) {
    console.error('Erro ao carregar post:', error);
    req.flash('error_msg', 'Erro ao carregar postagem');
    res.redirect('/posts');
  }
});

// Página para editar postagem
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id);
    
    if (!post) {
      req.flash('error_msg', 'Postagem não encontrada');
      return res.redirect('/posts');
    }

    // Verificar se o usuário é o dono da postagem
    if (post.userId !== req.session.user.id) {
      req.flash('error_msg', 'Você não tem permissão para editar esta postagem');
      return res.redirect('/posts');
    }

    res.render('posts/edit', { post, user: req.session.user });
  } catch (error) {
    console.error('Erro ao carregar post para edição:', error);
    req.flash('error_msg', 'Erro ao carregar postagem');
    res.redirect('/posts');
  }
});

// Atualizar postagem
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id);
    
    if (!post) {
      req.flash('error_msg', 'Postagem não encontrada');
      return res.redirect('/posts');
    }

    // Verificar se o usuário é o dono da postagem
    if (post.userId !== req.session.user.id) {
      req.flash('error_msg', 'Você não tem permissão para editar esta postagem');
      return res.redirect('/posts');
    }

    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      req.flash('error_msg', 'Título e conteúdo são obrigatórios');
      return res.redirect(`/posts/${post.id}/edit`);
    }

    await posts.update(post.id, {
      title,
      content,
      category: category || 'geral',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    req.flash('success_msg', 'Postagem atualizada com sucesso!');
    res.redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    req.flash('error_msg', 'Erro ao atualizar postagem');
    res.redirect('/posts');
  }
});

// Deletar postagem
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id);
    
    if (!post) {
      req.flash('error_msg', 'Postagem não encontrada');
      return res.redirect('/posts');
    }

    // Verificar se o usuário é o dono da postagem
    if (post.userId !== req.session.user.id) {
      req.flash('error_msg', 'Você não tem permissão para deletar esta postagem');
      return res.redirect('/posts');
    }

    await posts.delete(post.id);
    req.flash('success_msg', 'Postagem deletada com sucesso!');
    res.redirect('/posts');
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    req.flash('error_msg', 'Erro ao deletar postagem');
    res.redirect('/posts');
  }
});

module.exports = router;
