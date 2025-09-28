const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Importar e inicializar banco de dados
const { syncDatabase } = require('./models');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'devpoints-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true em produção com HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.use(flash());

// Handlebars configuration
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    },
    eq: (a, b) => a === b,
    substring: (str, start, length) => {
      if (!str) return '';
      return str.substring(start, start + length);
    },
    truncate: (str, length) => {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    },
    gt: (a, b) => a > b
  }
}));
app.set('view engine', 'handlebars');

// Import storage
const { users, posts } = require('./data/storage');

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/auth').router);
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// Home route
app.get('/', (req, res) => {
  res.render('home', {
    title: 'DevPoints',
    user: req.session.user
  });
});

// Demo route
app.get('/demo', (req, res) => {
  res.render('demo', { 
    title: 'Design System',
    user: req.session.user 
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Sincronizar banco de dados
    await syncDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 DevPoints rodando na porta ${PORT}`);
      console.log(`📊 Banco de dados SQLite conectado`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
