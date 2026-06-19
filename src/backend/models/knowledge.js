const { Sequelize, DataTypes } = require('sequelize');

// 知识文档模型
const KnowledgeDocument = (sequelize) => {
  return sequelize.define('KnowledgeDocument', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '文档标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '文档内容'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '文档类别'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签'
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '文件URL'
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '文件类型'
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '作者'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '所属部门'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '查看次数'
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '下载次数'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
      comment: '状态：草稿、已发布、已归档'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否公开'
    }
  }, {
    tableName: 'knowledge_documents',
    timestamps: true
  });
};

// 知识分类模型
const KnowledgeCategory = (sequelize) => {
  return sequelize.define('KnowledgeCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '分类名称'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父分类ID'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '分类描述'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    }
  }, {
    tableName: 'knowledge_categories',
    timestamps: true
  });
};

// 知识问答模型
const KnowledgeQA = (sequelize) => {
  return sequelize.define('KnowledgeQA', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '问题'
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '回答'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '问题类别'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签'
    },
    askedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '提问人'
    },
    answeredBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '回答人'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '查看次数'
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '有帮助次数'
    },
    status: {
      type: DataTypes.ENUM('pending', 'answered', 'closed'),
      defaultValue: 'pending',
      comment: '状态：待回答、已回答、已关闭'
    }
  }, {
    tableName: 'knowledge_qa',
    timestamps: true
  });
};

// 知识库搜索记录模型
const KnowledgeSearch = (sequelize) => {
  return sequelize.define('KnowledgeSearch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '搜索关键词'
    },
    resultCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '结果数量'
    },
    searchedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '搜索人'
    }
  }, {
    tableName: 'knowledge_searches',
    timestamps: true
  });
};

module.exports = {
  KnowledgeDocument,
  KnowledgeCategory,
  KnowledgeQA,
  KnowledgeSearch
};
