const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { users, posts } = require('../data/storage');

// Middleware para verificar se o usuário está logado
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('error_msg', 'Você precisa estar logado para acessar esta página');
    res.redirect('/login');
  }
};

// Middleware para verificar se o usuário NÃO está logado
const requireGuest = (req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

// Página de login
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login');
});

// Processar login
router.post('/login', requireGuest, (req, res) => {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    req.flash('error_msg', 'Email e senha são obrigatórios');
    return res.redirect('/login');
  }

  // Buscar usuário
  const user = users.find(u => u.email === email);
  if (!user) {
    req.flash('error_msg', 'Email ou senha incorretos');
    return res.redirect('/login');
  }

  // Verificar senha
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;
    
    if (isMatch) {
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      };
      req.flash('success_msg', 'Login realizado com sucesso!');
      res.redirect('/');
    } else {
      req.flash('error_msg', 'Email ou senha incorretos');
      res.redirect('/login');
    }
  });
});

// Página de registro
router.get('/register', requireGuest, (req, res) => {
  res.render('auth/register');
});

// Processar registro
router.post('/register', requireGuest, (req, res) => {
  const { name, email, username, password, confirmPassword } = req.body;

  // Validação básica
  if (!name || !email || !username || !password || !confirmPassword) {
    req.flash('error_msg', 'Todos os campos são obrigatórios');
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    req.flash('error_msg', 'As senhas não coincidem');
    return res.redirect('/register');
  }

  if (password.length < 6) {
    req.flash('error_msg', 'A senha deve ter pelo menos 6 caracteres');
    return res.redirect('/register');
  }

  // Verificar se email ou username já existem
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    req.flash('error_msg', 'Email ou nome de usuário já cadastrado');
    return res.redirect('/register');
  }

  // Criptografar senha
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        username,
        password: hash,
        createdAt: new Date()
      };

      users.push(newUser);
      req.flash('success_msg', 'Usuário cadastrado com sucesso! Faça login para continuar');
      res.redirect('/login');
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  req.flash('success_msg', 'Logout realizado com sucesso!');
  res.redirect('/');
});

module.exports = { router, requireAuth };
