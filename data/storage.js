// Database storage usando Sequelize
const { User, Post } = require('../models');

// Funções para manipular usuários
const userStorage = {
  async create(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  },

  async findByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  },

  async findById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [{ model: Post, as: 'posts' }]
      });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  },

  async findAll() {
    try {
      const users = await User.findAll({
        include: [{ model: Post, as: 'posts' }],
        order: [['points', 'DESC']]
      });
      return users;
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  },

  async update(id, userData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      await user.update(userData);
      return user;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      await user.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  },

  async addPoints(id, points) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      user.points += points;
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Erro ao adicionar pontos: ${error.message}`);
    }
  }
};

// Funções para manipular posts
const postStorage = {
  async create(postData) {
    try {
      const post = await Post.create(postData);
      return post;
    } catch (error) {
      throw new Error(`Erro ao criar post: ${error.message}`);
    }
  },

  async findById(id) {
    try {
      const post = await Post.findByPk(id, {
        include: [{ model: User, as: 'author' }]
      });
      return post;
    } catch (error) {
      throw new Error(`Erro ao buscar post: ${error.message}`);
    }
  },

  async findAll(options = {}) {
    try {
      const where = {};
      if (options.category) {
        where.category = options.category;
      }
      if (options.userId) {
        where.userId = options.userId;
      }
      if (options.isPublished !== undefined) {
        where.isPublished = options.isPublished;
      }

      const posts = await Post.findAll({
        where,
        include: [{ model: User, as: 'author' }],
        order: [['createdAt', 'DESC']],
        limit: options.limit || null,
        offset: options.offset || 0
      });
      return posts;
    } catch (error) {
      throw new Error(`Erro ao buscar posts: ${error.message}`);
    }
  },

  async update(id, postData) {
    try {
      const post = await Post.findByPk(id);
      if (!post) {
        throw new Error('Post não encontrado');
      }
      await post.update(postData);
      return post;
    } catch (error) {
      throw new Error(`Erro ao atualizar post: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const post = await Post.findByPk(id);
      if (!post) {
        throw new Error('Post não encontrado');
      }
      await post.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar post: ${error.message}`);
    }
  },

  async incrementViews(id) {
    try {
      const post = await Post.findByPk(id);
      if (!post) {
        throw new Error('Post não encontrado');
      }
      post.views += 1;
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Erro ao incrementar visualizações: ${error.message}`);
    }
  },

  async incrementLikes(id) {
    try {
      const post = await Post.findByPk(id);
      if (!post) {
        throw new Error('Post não encontrado');
      }
      post.likes += 1;
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Erro ao incrementar curtidas: ${error.message}`);
    }
  }
};

module.exports = {
  users: userStorage,
  posts: postStorage
};
