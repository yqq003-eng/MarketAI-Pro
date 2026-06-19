const express = require('express');
const router = express.Router();
const { User, Role, SystemConfig, OperationLog, SystemNotification } = require('../models/system');

// ==================== 用户管理 ====================

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, role, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) {
      where[Sequelize.Op.or] = [
        { username: { [Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [Sequelize.Op.like]: `%${keyword}%` } },
        { email: { [Sequelize.Op.like]: `%${keyword}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      data: rows,
      total: count,
      message: '获取成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 获取单个用户
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }

    res.json({ code: 0, data: user, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建用户
router.post('/users', async (req, res) => {
  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username: req.body.username } });
    if (existingUser) {
      return res.status(400).json({ code: -1, message: '用户名已存在' });
    }

    // 加密密码
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });

    // 不返回密码
    const userData = user.toJSON();
    delete userData.password;

    res.json({ code: 0, data: userData, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新用户
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }

    // 如果更新密码，需要加密
    if (req.body.password) {
      const bcrypt = require('bcrypt');
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete req.body.password;
    }

    await user.update(req.body);

    // 不返回密码
    const userData = user.toJSON();
    delete userData.password;

    res.json({ code: 0, data: userData, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }

    await user.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新用户状态
router.post('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }

    await user.update({ status: req.body.status });
    res.json({ code: 0, data: user, message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 角色管理 ====================

// 获取角色列表
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ code: 0, data: roles, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 获取单个角色
router.get('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ code: -1, message: '角色不存在' });
    }

    res.json({ code: 0, data: role, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建角色
router.post('/roles', async (req, res) => {
  try {
    // 检查角色代码是否已存在
    const existingRole = await Role.findOne({ where: { code: req.body.code } });
    if (existingRole) {
      return res.status(400).json({ code: -1, message: '角色代码已存在' });
    }

    const role = await Role.create(req.body);
    res.json({ code: 0, data: role, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新角色
router.put('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ code: -1, message: '角色不存在' });
    }

    await role.update(req.body);
    res.json({ code: 0, data: role, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除角色
router.delete('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ code: -1, message: '角色不存在' });
    }

    await role.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 系统配置管理 ====================

// 获取系统配置列表
router.get('/configs', async (req, res) => {
  try {
    const { group, isPublic } = req.query;
    const where = {};

    if (group) {
      where.group = group;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    const configs = await SystemConfig.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    res.json({ code: 0, data: configs, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 获取单个系统配置
router.get('/configs/:key', async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ where: { key: req.params.key } });
    if (!config) {
      return res.status(404).json({ code: -1, message: '配置不存在' });
    }

    // 如果不是公开配置，需要验证权限
    if (!config.isPublic) {
      // TODO: 验证用户权限
    }

    res.json({ code: 0, data: config, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建或更新系统配置
router.post('/configs', async (req, res) => {
  try {
    const { key, value, group, description, type, isPublic } = req.body;

    const [config, created] = await SystemConfig.findOrCreate({
      where: { key },
      defaults: { key, value, group, description, type, isPublic }
    });

    if (!created) {
      await config.update({ value, group, description, type, isPublic });
    }

    res.json({ code: 0, data: config, message: created ? '创建成功' : '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除系统配置
router.delete('/configs/:key', async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ where: { key: req.params.key } });
    if (!config) {
      return res.status(404).json({ code: -1, message: '配置不存在' });
    }

    await config.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 操作日志管理 ====================

// 获取操作日志列表
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, userId, module, action, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (userId) {
      where.userId = userId;
    }
    if (module) {
      where.module = module;
    }
    if (action) {
      where.action = action;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      data: rows,
      total: count,
      message: '获取成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 记录操作日志
router.post('/logs', async (req, res) => {
  try {
    const log = await OperationLog.create(req.body);
    res.json({ code: 0, data: log, message: '记录成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 清除操作日志
router.delete('/logs', async (req, res) => {
  try {
    const { days } = req.query;

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      await OperationLog.destroy({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: cutoffDate
          }
        }
      });
    } else {
      await OperationLog.destroy({ where: {} });
    }

    res.json({ code: 0, message: '清除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 系统通知管理 ====================

// 获取系统通知列表
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, isRead, isGlobal } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (type) {
      where.type = type;
    }
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    if (isGlobal !== undefined) {
      where.isGlobal = isGlobal === 'true';
    }

    const { count, rows } = await SystemNotification.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      data: rows,
      total: count,
      message: '获取成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 获取单个系统通知
router.get('/notifications/:id', async (req, res) => {
  try {
    const notification = await SystemNotification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ code: -1, message: '通知不存在' });
    }

    // 标记为已读
    if (!notification.isRead) {
      await notification.update({ isRead: true });
    }

    res.json({ code: 0, data: notification, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建系统通知
router.post('/notifications', async (req, res) => {
  try {
    const notification = await SystemNotification.create(req.body);
    res.json({ code: 0, data: notification, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新系统通知
router.put('/notifications/:id', async (req, res) => {
  try {
    const notification = await SystemNotification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ code: -1, message: '通知不存在' });
    }

    await notification.update(req.body);
    res.json({ code: 0, data: notification, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除系统通知
router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await SystemNotification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ code: -1, message: '通知不存在' });
    }

    await notification.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 标记通知为已读
router.post('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await SystemNotification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ code: -1, message: '通知不存在' });
    }

    await notification.update({ isRead: true });
    res.json({ code: 0, message: '标记成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 标记所有通知为已读
router.post('/notifications/read-all', async (req, res) => {
  try {
    await SystemNotification.update(
      { isRead: true },
      { where: { isRead: false } }
    );

    res.json({ code: 0, message: '标记成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 系统统计 ====================

// 获取系统统计信息
router.get('/statistics', async (req, res) => {
  try {
    const userCount = await User.count();
    const activeUserCount = await User.count({ where: { status: 'active' } });
    const roleCount = await Role.count();
    const configCount = await SystemConfig.count();
    const logCount = await OperationLog.count();
    const unreadNotificationCount = await SystemNotification.count({ where: { isRead: false } });

    const recentLogs = await OperationLog.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    const recentNotifications = await SystemNotification.findAll({
      where: { isRead: false },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      data: {
        userCount,
        activeUserCount,
        roleCount,
        configCount,
        logCount,
        unreadNotificationCount,
        recentLogs,
        recentNotifications
      },
      message: '获取成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

module.exports = router;
