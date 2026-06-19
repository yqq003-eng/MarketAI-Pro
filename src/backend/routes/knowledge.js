const express = require('express');
const router = express.Router();
const { KnowledgeDocument, KnowledgeCategory, KnowledgeQA, KnowledgeSearch } = require('../models/knowledge');

// ==================== 知识文档管理 ====================

// 获取知识文档列表
router.get('/documents', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, category, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) {
      where.title = { [Sequelize.Op.like]: `%${keyword}%` };
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await KnowledgeDocument.findAndCountAll({
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

// 获取单个知识文档
router.get('/documents/:id', async (req, res) => {
  try {
    const document = await KnowledgeDocument.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ code: -1, message: '文档不存在' });
    }

    // 增加查看次数
    await document.increment('viewCount');

    res.json({ code: 0, data: document, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建知识文档
router.post('/documents', async (req, res) => {
  try {
    const document = await KnowledgeDocument.create(req.body);
    res.json({ code: 0, data: document, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新知识文档
router.put('/documents/:id', async (req, res) => {
  try {
    const document = await KnowledgeDocument.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ code: -1, message: '文档不存在' });
    }

    await document.update(req.body);
    res.json({ code: 0, data: document, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除知识文档
router.delete('/documents/:id', async (req, res) => {
  try {
    const document = await KnowledgeDocument.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ code: -1, message: '文档不存在' });
    }

    await document.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 下载知识文档
router.post('/documents/:id/download', async (req, res) => {
  try {
    const document = await KnowledgeDocument.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ code: -1, message: '文档不存在' });
    }

    // 增加下载次数
    await document.increment('downloadCount');

    res.json({ code: 0, data: { fileUrl: document.fileUrl }, message: '获取下载链接成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 知识分类管理 ====================

// 获取知识分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await KnowledgeCategory.findAll({
      order: [['sortOrder', 'ASC']]
    });

    res.json({ code: 0, data: categories, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建知识分类
router.post('/categories', async (req, res) => {
  try {
    const category = await KnowledgeCategory.create(req.body);
    res.json({ code: 0, data: category, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新知识分类
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await KnowledgeCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ code: -1, message: '分类不存在' });
    }

    await category.update(req.body);
    res.json({ code: 0, data: category, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除知识分类
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await KnowledgeCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ code: -1, message: '分类不存在' });
    }

    await category.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 知识问答管理 ====================

// 获取知识问答列表
router.get('/qa', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, category, status } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};

    if (keyword) {
      where.question = { [Sequelize.Op.like]: `%${keyword}%` };
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await KnowledgeQA.findAndCountAll({
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

// 获取单个知识问答
router.get('/qa/:id', async (req, res) => {
  try {
    const qa = await KnowledgeQA.findByPk(req.params.id);
    if (!qa) {
      return res.status(404).json({ code: -1, message: '问答不存在' });
    }

    // 增加查看次数
    await qa.increment('viewCount');

    res.json({ code: 0, data: qa, message: '获取成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 创建问题
router.post('/qa', async (req, res) => {
  try {
    const qa = await KnowledgeQA.create({
      ...req.body,
      status: 'pending'
    });
    res.json({ code: 0, data: qa, message: '提问成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 回答问题
router.post('/qa/:id/answer', async (req, res) => {
  try {
    const qa = await KnowledgeQA.findByPk(req.params.id);
    if (!qa) {
      return res.status(404).json({ code: -1, message: '问答不存在' });
    }

    await qa.update({
      answer: req.body.answer,
      answeredBy: req.body.answeredBy,
      status: 'answered'
    });

    res.json({ code: 0, data: qa, message: '回答成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 更新知识问答
router.put('/qa/:id', async (req, res) => {
  try {
    const qa = await KnowledgeQA.findByPk(req.params.id);
    if (!qa) {
      return res.status(404).json({ code: -1, message: '问答不存在' });
    }

    await qa.update(req.body);
    res.json({ code: 0, data: qa, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 删除知识问答
router.delete('/qa/:id', async (req, res) => {
  try {
    const qa = await KnowledgeQA.findByPk(req.params.id);
    if (!qa) {
      return res.status(404).json({ code: -1, message: '问答不存在' });
    }

    await qa.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 标记有帮助
router.post('/qa/:id/helpful', async (req, res) => {
  try {
    const qa = await KnowledgeQA.findByPk(req.params.id);
    if (!qa) {
      return res.status(404).json({ code: -1, message: '问答不存在' });
    }

    await qa.increment('helpfulCount');

    res.json({ code: 0, message: '标记成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// ==================== 知识搜索 ====================

// 搜索知识库
router.get('/search', async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({ code: -1, message: '请输入搜索关键词' });
    }

    const offset = (page - 1) * pageSize;

    // 搜索文档
    const documents = await KnowledgeDocument.findAndCountAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${keyword}%` } },
          { content: { [Sequelize.Op.like]: `%${keyword}%` } }
        ],
        status: 'published'
      },
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // 搜索问答
    const qa = await KnowledgeQA.findAndCountAll({
      where: {
        [Sequelize.Op.or]: [
          { question: { [Sequelize.Op.like]: `%${keyword}%` } },
          { answer: { [Sequelize.Op.like]: `%${keyword}%` } }
        ],
        status: 'answered'
      },
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // 记录搜索
    await KnowledgeSearch.create({
      keyword,
      resultCount: documents.count + qa.count,
      searchedBy: req.body.searchedBy
    });

    res.json({
      code: 0,
      data: {
        documents: documents.rows,
        qa: qa.rows,
        totalDocuments: documents.count,
        totalQA: qa.count
      },
      message: '搜索成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 获取搜索历史
router.get('/search/history', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await KnowledgeSearch.findAndCountAll({
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

// ==================== 统计信息 ====================

// 获取知识库统计信息
router.get('/statistics', async (req, res) => {
  try {
    const documentCount = await KnowledgeDocument.count({ where: { status: 'published' } });
    const categoryCount = await KnowledgeCategory.count();
    const qaCount = await KnowledgeQA.count({ where: { status: 'answered' } });
    const pendingQACount = await KnowledgeQA.count({ where: { status: 'pending' } });

    const topDocuments = await KnowledgeDocument.findAll({
      where: { status: 'published' },
      order: [['viewCount', 'DESC']],
      limit: 10
    });

    const topSearches = await KnowledgeSearch.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      code: 0,
      data: {
        documentCount,
        categoryCount,
        qaCount,
        pendingQACount,
        topDocuments,
        topSearches
      },
      message: '获取成功'
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: error.message });
  }
});

module.exports = router;
