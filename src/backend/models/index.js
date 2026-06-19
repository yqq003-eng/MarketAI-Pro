const { Sequelize, DataTypes } = require('sequelize')
const path = require('path')

// 数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../../database/marketai.db'),
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
    underscored: true
  }
})

// 导入所有模型
const User = require('./user')(sequelize, DataTypes)
const Department = require('./department')(sequelize, DataTypes)
const Device = require('./device')(sequelize, DataTypes)
const ActivationCode = require('./activation-code')(sequelize, DataTypes)
const Video = require('./video')(sequelize, DataTypes)
const VideoAccount = require('./video-account')(sequelize, DataTypes)
const VideoTask = require('./video-task')(sequelize, DataTypes)
const WechatAccount = require('./wechat-account')(sequelize, DataTypes)
const WechatMessage = require('./wechat-message')(sequelize, DataTypes)
const WecomAccount = require('./wecom-account')(sequelize, DataTypes)
const KnowledgeBase = require('./knowledge-base')(sequelize, DataTypes)
const AIAgent = require('./ai-agent')(sequelize, DataTypes)

// 导入数字人短视频模块模型
const { DigitalVoice, DigitalAvatar, DigitalRefine, DigitalRefineLibrary, DigitalGeneration } = require('./digital')(sequelize)

// 导入企业微信运营模块模型
const { WecomCustomer, WecomGroup, WecomMassMessage, WecomAutoReply, WecomCustomerTag, WecomEmployee } = require('./wecom')(sequelize)

// 导入BOSS招聘模块模型
const { BossJob, BossCandidate, BossChat } = require('./boss')(sequelize)

// 导入法务智能模块模型
const { LegalConsult, LegalSearch, ContractReview } = require('./legal')(sequelize)

// 导入企业智库模块模型
const { KnowledgeDocument, KnowledgeCategory, KnowledgeQA, KnowledgeSearch } = require('./knowledge')(sequelize)

// 导入系统管理模块模型
const { User: SystemUser, Role, SystemConfig, OperationLog, SystemNotification } = require('./system')(sequelize)

// 定义模型关联关系
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' })
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' })

User.hasMany(Device, { foreignKey: 'user_id', as: 'devices' })
Device.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasMany(Video, { foreignKey: 'user_id', as: 'videos' })
Video.belongsTo(User, { foreignKey: 'user_id', as: 'creator' })

User.hasMany(VideoAccount, { foreignKey: 'user_id', as: 'accounts' })
VideoAccount.belongsTo(User, { foreignKey: 'user_id', as: 'owner' })

VideoAccount.hasMany(VideoTask, { foreignKey: 'account_id', as: 'tasks' })
VideoTask.belongsTo(VideoAccount, { foreignKey: 'account_id', as: 'account' })

User.hasMany(DigitalHuman, { foreignKey: 'user_id', as: 'digital-humans' })
DigitalHuman.belongsTo(User, { foreignKey: 'user_id', as: 'creator' })

User.hasMany(WechatAccount, { foreignKey: 'user_id', as: 'wechat-accounts' })
WechatAccount.belongsTo(User, { foreignKey: 'user_id', as: 'owner' })

WechatAccount.hasMany(WechatMessage, { foreignKey: 'account_id', as: 'messages' })
WechatMessage.belongsTo(WechatAccount, { foreignKey: 'account_id', as: 'account' })

User.hasMany(WecomAccount, { foreignKey: 'user_id', as: 'wecom-accounts' })
WecomAccount.belongsTo(User, { foreignKey: 'user_id', as: 'owner' })

User.hasMany(BossJob, { foreignKey: 'user_id', as: 'boss-jobs' })
BossJob.belongsTo(User, { foreignKey: 'user_id', as: 'recruiter' })

User.hasMany(LegalConsult, { foreignKey: 'user_id', as: 'legal-consults' })
LegalConsult.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasMany(KnowledgeBase, { foreignKey: 'user_id', as: 'knowledge-bases' })
KnowledgeBase.belongsTo(User, { foreignKey: 'user_id', as: 'creator' })

User.hasMany(KnowledgeDocument, { foreignKey: 'user_id', as: 'knowledge-documents' })
KnowledgeDocument.belongsTo(User, { foreignKey: 'user_id', as: 'creator' })

User.hasMany(KnowledgeQA, { foreignKey: 'user_id', as: 'knowledge-qa' })
KnowledgeQA.belongsTo(User, { foreignKey: 'user_id', as: 'asker' })

// 同步数据库
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: true })
    console.log('✓ 数据库同步成功')
  } catch (error) {
    console.error('✗ 数据库同步失败:', error)
  }
}

module.exports = {
  sequelize,
  syncDatabase,
  models: {
    User,
    Department,
    Device,
    ActivationCode,
    Video,
    VideoAccount,
    VideoTask,
    WechatAccount,
    WechatMessage,
    WecomAccount,
    KnowledgeBase,
    AIAgent,
    // 数字人短视频模块
    DigitalVoice,
    DigitalAvatar,
    DigitalRefine,
    DigitalRefineLibrary,
    DigitalGeneration,
    // 企业微信运营模块
    WecomCustomer,
    WecomGroup,
    WecomMassMessage,
    WecomAutoReply,
    WecomCustomerTag,
    WecomEmployee,
    // BOSS招聘模块
    BossJob,
    BossCandidate,
    BossChat,
    // 法务智能模块
    LegalConsult,
    LegalSearch,
    ContractReview,
    // 企业智库模块
    KnowledgeDocument,
    KnowledgeCategory,
    KnowledgeQA,
    KnowledgeSearch,
    // 系统管理模块
    SystemUser,
    Role,
    SystemConfig,
    OperationLog,
    SystemNotification
  }
}
