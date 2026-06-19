const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  // 企业微信客户表
  const WecomCustomer = sequelize.define('WecomCustomer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '标签，逗号分隔'
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '负责人'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_customers',
    timestamps: false
  })

  // 企业微信群组表
  const WecomGroup = sequelize.define('WecomGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '群名称'
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '群主'
    },
    member_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '成员数'
    },
    message_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '消息数'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
      comment: '状态：active-活跃，inactive-沉寂'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_groups',
    timestamps: false
  })

  // 企业微信消息群发表
  const WecomMassMessage = sequelize.define('WecomMassMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '任务名称'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    target_type: {
      type: DataTypes.STRING,
      defaultValue: 'all',
      comment: '目标类型：all-全部客户，tags-按标签'
    },
    target_tags: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '目标标签，逗号分隔'
    },
    send_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发送时间'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      comment: '状态：draft-草稿，pending-待发送，sent-已发送，cancelled-已取消'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_mass_messages',
    timestamps: false
  })

  // 企业微信自动回复表
  const WecomAutoReply = sequelize.define('WecomAutoReply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '规则名称'
    },
    keywords: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '关键词，逗号分隔'
    },
    reply_type: {
      type: DataTypes.STRING,
      defaultValue: 'text',
      comment: '回复类型：text-文本，image-图片，link-链接'
    },
    reply_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '回复内容'
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_auto_replies',
    timestamps: false
  })

  // 企业微信客户标签表
  const WecomCustomerTag = sequelize.define('WecomCustomerTag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标签名称'
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#409EFF',
      comment: '标签颜色'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '标签描述'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_customer_tags',
    timestamps: false
  })

  // 企业微信员工表
  const WecomEmployee = sequelize.define('WecomEmployee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '姓名'
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '职位'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '部门'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '邮箱'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
      comment: '状态：active-在职，inactive-离职'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wecom_employees',
    timestamps: false
  })

  return {
    WecomCustomer,
    WecomGroup,
    WecomMassMessage,
    WecomAutoReply,
    WecomCustomerTag,
    WecomEmployee
  }
}
