const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  // BOSS职位表
  const BossJob = sequelize.define('BossJob', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '职位标题'
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '公司名称'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '工作地点'
    },
    salary: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '薪资范围'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '职位描述'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任职要求'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
      comment: '状态：active-活跃，closed-已关闭'
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
    tableName: 'boss_jobs',
    timestamps: false
  })

  // BOSS候选人表
  const BossCandidate = sequelize.define('BossCandidate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '候选人姓名'
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
    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '简历URL'
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '应聘职位ID'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: '状态：pending-待处理，interviewing-面试中，hired-已录用，rejected-已拒绝'
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
    tableName: 'boss_candidates',
    timestamps: false
  })

  // BOSS聊天记录表
  const BossChat = sequelize.define('BossChat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '候选人ID'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    sender: {
      type: DataTypes.STRING,
      defaultValue: 'recruiter',
      comment: '发送者：recruiter-招聘者，candidate-候选人'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'boss_chats',
    timestamps: false
  })

  return {
    BossJob,
    BossCandidate,
    BossChat
  }
}
