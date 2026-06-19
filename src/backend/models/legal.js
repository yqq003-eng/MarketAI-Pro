const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  // 法律咨询表
  const LegalConsult = sequelize.define('LegalConsult', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '咨询标题'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '咨询分类'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '咨询内容'
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '回答内容'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: '状态：pending-待处理，answered-已回答，closed-已关闭'
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
    tableName: 'legal_consults',
    timestamps: false
  })

  // 法律检索表
  const LegalSearch = sequelize.define('LegalSearch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '检索关键词'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '法律分类'
    },
    result_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '结果数量'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'legal_searches',
    timestamps: false
  })

  // 合同审查表
  const ContractReview = sequelize.define('ContractReview', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '合同标题'
    },
    contract_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '合同类型'
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '合同文件URL'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '合同内容'
    },
    issues: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '问题点'
    },
    suggestions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '修改建议'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: '状态：pending-待审查，reviewed-已审查，approved-已批准'
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
    tableName: 'contract_reviews',
    timestamps: false
  })

  return {
    LegalConsult,
    LegalSearch,
    ContractReview
  }
}
