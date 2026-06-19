module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '视频时长（秒）'
    },
    resolution: {
      type: DataTypes.STRING(20),
      defaultValue: '1920x1080'
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      defaultValue: ''
    },
    platform: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: '发布的平台列表'
    },
    status: {
      type: DataTypes.ENUM('draft', 'processing', 'ready', 'scheduled', 'published', 'failed'),
      defaultValue: 'draft'
    },
    publish_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '定时发布时间'
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    play_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '额外的元数据'
    }
  }, {
    tableName: 'videos',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['publish_time'] },
      { fields: ['created_at'] }
    ]
  })

  return Video
}
