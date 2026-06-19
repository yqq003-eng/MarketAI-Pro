const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  // 数字人声音表
  const DigitalVoice = sequelize.define('DigitalVoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '声音名称'
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: 'male',
      comment: '性别：male-男，female-女'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '年龄'
    },
    style: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '风格'
    },
    sample_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '样本音频URL'
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
    tableName: 'digital_voices',
    timestamps: false
  })

  // 数字人形象表
  const DigitalAvatar = sequelize.define('DigitalAvatar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '形象名称'
    },
    gender: {
      type: DataTypes.STRING,
      defaultValue: 'male',
      comment: '性别：male-男，female-女'
    },
    age_range: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '年龄范围'
    },
    style: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '风格'
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '照片URL'
    },
    model_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '3D模型URL'
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
    tableName: 'digital_avatars',
    timestamps: false
  })

  // 数字人精剪表
  const DigitalRefine = sequelize.define('DigitalRefine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标题'
    },
    voice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '声音ID'
    },
    avatar_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '形象ID'
    },
    script: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '脚本内容'
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '视频URL'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '时长（秒）'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      comment: '状态：draft-草稿，processing-处理中，completed-已完成，failed-失败'
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
    tableName: 'digital_refines',
    timestamps: false
  })

  // 数字人精剪库表
  const DigitalRefineLibrary = sequelize.define('DigitalRefineLibrary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标题'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '分类'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '描述'
    },
    template_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '模板URL'
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '缩略图URL'
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
    tableName: 'digital_refine_library',
    timestamps: false
  })

  // 数字人视频生成表
  const DigitalGeneration = sequelize.define('DigitalGeneration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '标题'
    },
    voice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '声音ID'
    },
    avatar_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '形象ID'
    },
    script: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '脚本内容'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '时长（秒）'
    },
    output_format: {
      type: DataTypes.STRING,
      defaultValue: 'mp4',
      comment: '输出格式'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: '状态：pending-待处理，processing-处理中，completed-已完成，failed-失败'
    },
    output_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '输出视频URL'
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
    tableName: 'digital_generations',
    timestamps: false
  })

  return {
    DigitalVoice,
    DigitalAvatar,
    DigitalRefine,
    DigitalRefineLibrary,
    DigitalGeneration
  }
}
