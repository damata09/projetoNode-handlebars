const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 5000]
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'geral',
    validate: {
      isIn: [['javascript', 'python', 'java', 'react', 'node', 'sql', 'css', 'html', 'geral', 'dicas', 'tutoriais']]
    }
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const tags = this.getDataValue('tags');
      return tags ? tags.split(',') : [];
    },
    set(tags) {
      this.setDataValue('tags', Array.isArray(tags) ? tags.join(',') : tags);
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'posts'
});

module.exports = Post;
