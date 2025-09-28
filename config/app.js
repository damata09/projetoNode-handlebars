module.exports = {
  // Configurações da aplicação
  app: {
    name: 'DevPoints',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'devpoints-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  },

  // Configurações do banco de dados
  database: {
    dialect: 'sqlite',
    storage: './database/devpoints.sqlite',
    logging: process.env.NODE_ENV === 'development'
  },

  // Configurações de upload (futuro)
  upload: {
    path: './public/uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};
