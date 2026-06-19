const { Sequelize, DataTypes } = require('sequelize');

// 用户模型
const User = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '密码'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '姓名'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '手机号'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '头像URL'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '所属部门'
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '职位'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      comment: '角色'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'locked'),
      defaultValue: 'active',
      comment: '状态：激活、未激活、锁定'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });
};

// 角色模型
const Role = (sequelize) => {
  return sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '角色名称'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '角色代码'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '角色描述'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '权限列表'
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });
};

// 系统配置模型
const SystemConfig = (sequelize) => {
  return sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '配置键'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配置值'
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '配置分组'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '配置描述'
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'array'),
      defaultValue: 'string',
      comment: '配置类型'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否公开'
    }
  }, {
    tableName: 'system_configs',
    timestamps: true
  });
};

// 操作日志模型
const OperationLog = (sequelize) => {
  return sequelize.define('OperationLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '操作用户ID'
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '操作模块'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '操作动作'
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '操作资源'
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '资源ID'
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '操作详情'
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户代理'
    }
  }, {
    tableName: 'operation_logs',
    timestamps: true
  });
};

// 系统通知模型
const SystemNotification = (sequelize) => {
  return sequelize.define('SystemNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '通知标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '通知内容'
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
      defaultValue: 'info',
      comment: '通知类型'
    },
    targetUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '目标用户ID，为空表示全部用户'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读'
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否全局通知'
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间'
    }
  }, {
    tableName: 'system_notifications',
    timestamps: true
  });
};

module.exports = {
  User,
  Role,
  SystemConfig,
  OperationLog,
  SystemNotification
};
