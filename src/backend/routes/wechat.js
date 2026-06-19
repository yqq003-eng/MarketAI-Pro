const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 获取地图获客数据
router.get('/map-customers', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    // 模拟数据 - 实际应该从数据库查询
    const customers = [
      {
        id: 1,
        nickname: '张三',
        avatar: 'https://via.placeholder.com/60',
        distance: 500,
        location: '北京市朝阳区',
        wechatId: 'zhangsan123',
        phone: '13800138000',
        tags: ['潜在客户', '兴趣度高'],
        lastActive: '2026-06-19 15:30:00'
      },
      {
        id: 2,
        nickname: '李四',
        avatar: 'https://via.placeholder.com/60',
        distance: 800,
        location: '北京市海淀区',
        wechatId: 'lisi456',
        phone: '13900139000',
        tags: ['已联系'],
        lastActive: '2026-06-18 10:20:00'
      }
    ];

    res.json({
      success: true,
      data: {
        total: customers.length,
        customers
      }
    });
  } catch (error) {
    console.error('Get map customers error:', error);
    res.status(500).json({
      success: false,
      message: '获取地图获客数据失败'
    });
  }
});

// 添加客户
router.post('/customers', authMiddleware, async (req, res) => {
  try {
    const { nickname, wechatId, phone, tags, notes } = req.body;

    // 实际应该保存到数据库
    const customer = {
      id: Date.now(),
      nickname,
      wechatId,
      phone,
      tags: tags || [],
      notes: notes || '',
      createdAt: new Date()
    };

    console.log('Add customer:', customer);

    res.json({
      success: true,
      data: customer,
      message: '客户添加成功'
    });
  } catch (error) {
    console.error('Add customer error:', error);
    res.status(500).json({
      success: false,
      message: '添加客户失败'
    });
  }
});

// 获取聚合聊天列表
router.get('/chat/list', authMiddleware, async (req, res) => {
  try {
    // 模拟数据
    const chatList = [
      {
        id: 1,
        customerName: '张三',
        customerAvatar: 'https://via.placeholder.com/40',
        lastMessage: '您好，我想了解一下产品',
        lastTime: '2026-06-20 10:30:00',
        unreadCount: 3,
        status: 'active'
      },
      {
        id: 2,
        customerName: '李四',
        customerAvatar: 'https://via.placeholder.com/40',
        lastMessage: '谢谢，我考虑一下',
        lastTime: '2026-06-19 15:20:00',
        unreadCount: 0,
        status: 'replied'
      }
    ];

    res.json({
      success: true,
      data: chatList
    });
  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天列表失败'
    });
  }
});

// 获取聊天记录
router.get('/chat/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 模拟数据
    const messages = [
      {
        id: 1,
        chatId: id,
        sender: 'customer',
        content: '您好，我想了解一下产品',
        time: '2026-06-20 10:30:00',
        type: 'text'
      },
      {
        id: 2,
        chatId: id,
        sender: 'user',
        content: '您好！很高兴为您服务，请问您想了解哪方面的信息呢？',
        time: '2026-06-20 10:32:00',
        type: 'text'
      }
    ];

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天记录失败'
    });
  }
});

// 发送消息
router.post('/chat/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    // 实际应该保存到数据库并发送到微信
    const message = {
      id: Date.now(),
      chatId: id,
      sender: 'user',
      content,
      type: type || 'text',
      time: new Date()
    };

    console.log('Send message:', message);

    res.json({
      success: true,
      data: message,
      message: '消息发送成功'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    });
  }
});

// 获取标签列表
router.get('/tags', authMiddleware, async (req, res) => {
  try {
    // 模拟数据
    const tags = [
      { id: 1, name: '潜在客户', color: '#409EFF', count: 45 },
      { id: 2, name: '已联系', color: '#67C23A', count: 32 },
      { id: 3, name: '意向度高', color: '#E6A23C', count: 18 },
      { id: 4, name: '已成交', color: '#F56C6C', count: 12 }
    ];

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: '获取标签列表失败'
    });
  }
});

// 创建标签
router.post('/tags', authMiddleware, async (req, res) => {
  try {
    const { name, color } = req.body;

    const tag = {
      id: Date.now(),
      name,
      color: color || '#409EFF',
      count: 0
    };

    console.log('Create tag:', tag);

    res.json({
      success: true,
      data: tag,
      message: '标签创建成功'
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: '创建标签失败'
    });
  }
});

// 删除标签
router.delete('/tags/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete tag:', id);

    res.json({
      success: true,
      message: '标签删除成功'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: '删除标签失败'
    });
  }
});

// 获取关键词回复列表
router.get('/keyword-replies', authMiddleware, async (req, res) => {
  try {
    // 模拟数据
    const replies = [
      {
        id: 1,
        keyword: '价格',
        reply: '我们的产品价格非常优惠，具体可以加我微信详细沟通哦~',
        matchType: 'exact',
        status: true,
        useCount: 45
      },
      {
        id: 2,
        keyword: '怎么用',
        reply: '您好！产品使用很简单，我发您一个教程视频，一看就懂~',
        matchType: 'fuzzy',
        status: true,
        useCount: 32
      }
    ];

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Get keyword replies error:', error);
    res.status(500).json({
      success: false,
      message: '获取关键词回复失败'
    });
  }
});

// 创建关键词回复
router.post('/keyword-replies', authMiddleware, async (req, res) => {
  try {
    const { keyword, reply, matchType } = req.body;

    const keywordReply = {
      id: Date.now(),
      keyword,
      reply,
      matchType: matchType || 'exact',
      status: true,
      useCount: 0
    };

    console.log('Create keyword reply:', keywordReply);

    res.json({
      success: true,
      data: keywordReply,
      message: '关键词回复创建成功'
    });
  } catch (error) {
    console.error('Create keyword reply error:', error);
    res.status(500).json({
      success: false,
      message: '创建关键词回复失败'
    });
  }
});

// 获取群发任务列表
router.get('/mass-send', authMiddleware, async (req, res) => {
  try {
    // 模拟数据
    const tasks = [
      {
        id: 1,
        name: '新品推广群发',
        targetCount: 100,
        sentCount: 100,
        status: 'completed',
        createTime: '2026-06-18 10:00:00'
      },
      {
        id: 2,
        name: '活动通知群发',
        targetCount: 50,
        sentCount: 32,
        status: 'processing',
        createTime: '2026-06-19 14:00:00'
      }
    ];

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get mass send tasks error:', error);
    res.status(500).json({
      success: false,
      message: '获取群发任务失败'
    });
  }
});

// 创建群发任务
router.post('/mass-send', authMiddleware, async (req, res) => {
  try {
    const { name, content, targetTags, scheduleTime } = req.body;

    const task = {
      id: Date.now(),
      name,
      content,
      targetTags,
      scheduleTime,
      targetCount: 0,
      sentCount: 0,
      status: 'pending',
      createTime: new Date()
    };

    console.log('Create mass send task:', task);

    // 实际应该：
    // 1. 保存任务到数据库
    // 2. 如果设置了定时，添加到任务队列
    // 3. 否则立即开始发送

    res.json({
      success: true,
      data: task,
      message: '群发任务创建成功'
    });
  } catch (error) {
    console.error('Create mass send task error:', error);
    res.status(500).json({
      success: false,
      message: '创建群发任务失败'
    });
  }
});

// 获取好友列表
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, tag } = req.query;

    // 模拟数据
    const friends = [
      {
        id: 1,
        nickname: '张三',
        avatar: 'https://via.placeholder.com/60',
        wechatId: 'zhangsan123',
        phone: '13800138000',
        tags: ['潜在客户'],
        lastChatTime: '2026-06-19 15:30:00',
        status: 'active'
      },
      {
        id: 2,
        nickname: '李四',
        avatar: 'https://via.placeholder.com/60',
        wechatId: 'lisi456',
        phone: '13900139000',
        tags: ['已联系'],
        lastChatTime: '2026-06-18 10:20:00',
        status: 'replied'
      }
    ];

    res.json({
      success: true,
      data: {
        total: friends.length,
        friends
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: '获取好友列表失败'
    });
  }
});

// 获取朋友圈任务列表
router.get('/moments', authMiddleware, async (req, res) => {
  try {
    // 模拟数据
    const tasks = [
      {
        id: 1,
        name: '产品宣传朋友圈',
        content: '今天给大家推荐一款超好用的产品...',
        images: ['https://via.placeholder.com/300'],
        scheduleTime: '2026-06-20 09:00:00',
        status: 'scheduled'
      },
      {
        id: 2,
        name: '活动推广朋友圈',
        content: '限时优惠活动开始了...',
        images: ['https://via.placeholder.com/300'],
        scheduleTime: '',
        status: 'published'
      }
    ];

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get moments tasks error:', error);
    res.status(500).json({
      success: false,
      message: '获取朋友圈任务失败'
    });
  }
});

// 创建朋友圈任务
router.post('/moments', authMiddleware, async (req, res) => {
  try {
    const { name, content, images, scheduleTime } = req.body;

    const task = {
      id: Date.now(),
      name,
      content,
      images,
      scheduleTime,
      status: scheduleTime ? 'scheduled' : 'published',
      createTime: new Date()
    };

    console.log('Create moments task:', task);

    res.json({
      success: true,
      data: task,
      message: '朋友圈任务创建成功'
    });
  } catch (error) {
    console.error('Create moments task error:', error);
    res.status(500).json({
      success: false,
      message: '创建朋友圈任务失败'
    });
  }
});

module.exports = router;
