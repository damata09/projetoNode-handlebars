const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'sistema-postagens-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

// Handlebars configuration
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
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

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// Import storage
const { users, posts } = require('./data/storage');

// Routes
app.use('/', require('./routes/auth').router);
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// Home route
app.get('/', (req, res) => {
  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  res.render('home', { 
    posts: recentPosts,
    user: req.session.user 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
