module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: ''
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user', 'guest'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login_ip: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    activation_code_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
      }
    }
  }, {
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { fields: ['department_id'] },
      { fields: ['role'] },
      { fields: ['status'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const bcrypt = require('bcryptjs')
          user.password = await bcrypt.hash(user.password, 10)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const bcrypt = require('bcryptjs')
          user.password = await bcrypt.hash(user.password, 10)
        }
      }
    }
  })

  // 实例方法
  User.prototype.validatePassword = async function(password) {
    const bcrypt = require('bcryptjs')
    return await bcrypt.compare(password, this.password)
  }

  User.prototype.generateToken = function() {
    const jwt = require('jsonwebtoken')
    return jwt.sign(
      { id: this.id, username: this.username, role: this.role },
      process.env.JWT_SECRET || 'marketai-secret-key',
      { expiresIn: '7d' }
    )
  }

  return User
}
