# DevPoints 🚀

Sistema de pontos e postagens para desenvolvedores com Node.js, Express, Handlebars e SQLite.

## ✨ Funcionalidades

- **Sistema de Usuários**: Registro, login e perfis de desenvolvedores
- **Sistema de Pontos**: Pontuação baseada em atividades e contribuições
- **Postagens**: Criação e gerenciamento de posts técnicos
- **Categorias**: Organização por tecnologias (JavaScript, Python, React, etc.)
- **Sistema de Curtidas**: Interação com posts
- **Visualizações**: Contagem de visualizações dos posts

## 🛠️ Tecnologias

- **Backend**: Node.js + Express.js
- **Template Engine**: Handlebars
- **Banco de Dados**: SQLite com Sequelize ORM
- **Autenticação**: Sessions + bcryptjs
- **Frontend**: HTML, CSS, JavaScript

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd devpoints
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a migração do banco de dados:
```bash
npm run db:migrate
```

4. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🗄️ Banco de Dados

O projeto usa SQLite com Sequelize ORM. O banco de dados é criado automaticamente na pasta `database/` quando o servidor é iniciado.

### Modelos

- **User**: Usuários com sistema de pontos
- **Post**: Postagens com categorias e métricas

## 🚀 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run db:migrate` - Executa migração do banco de dados

## 📁 Estrutura do Projeto

```
devpoints/
├── config/
│   └── database.js          # Configuração do banco
├── data/
│   └── storage.js           # Camada de acesso aos dados
├── models/
│   ├── User.js              # Modelo de usuário
│   ├── Post.js              # Modelo de post
│   └── index.js             # Relacionamentos e sincronização
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── posts.js             # Rotas de posts
│   └── users.js             # Rotas de usuários
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── auth/
│   ├── posts/
│   └── users/
├── scripts/
│   └── migrate.js           # Script de migração
├── app.js                   # Aplicação principal
└── package.json
```

## 🔧 Configuração

O servidor roda por padrão na porta 3000. Para alterar, defina a variável de ambiente `PORT`:

```bash
PORT=8080 npm start
```

## 📝 Licença

MIT License
