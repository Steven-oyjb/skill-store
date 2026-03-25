const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SKILLS_DIR = path.join(__dirname, '../../skills');

// Ensure skills directory exists
if (!fs.existsSync(SKILLS_DIR)) {
  fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

// Mock skill data with more fields
const mockSkills = [
  {
    id: 'skill-001',
    name: '飞书任务创建',
    description: '快速创建飞书任务，支持设置负责人、截止时间、提醒等',
    category: '飞书集成',
    tags: ['飞书', '任务', '自动化'],
    author: 'System',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    version: '1.0.0',
    versionHistory: [
      { version: '1.0.0', date: '2026-01-15', changes: '初始版本发布' },
      { version: '0.9.0', date: '2026-01-10', changes: 'Beta 版本' }
    ],
    rating: 4.8,
    ratingCount: 156,
    downloadCount: 1234,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    status: 'published',
    config: {
      triggers: ['关键词触发'],
      actions: ['创建飞书任务']
    },
    prompt: '你是一个飞书任务助手。当用户要求创建任务时，请提取任务标题、负责人、截止时间等信息，并调用飞书 API 创建任务。',
    parameters: [
      { name: 'title', type: 'string', required: true, description: '任务标题' },
      { name: 'assignee', type: 'string', required: false, description: '负责人' },
      { name: 'dueDate', type: 'string', required: false, description: '截止日期' }
    ],
    usageInstructions: '在对话中输入"创建任务 任务名称"即可触发',
    reviews: [
      { id: 'r1', user: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', rating: 5, comment: '很好用！', date: '2026-01-20' },
      { id: 'r2', user: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', rating: 4, comment: '基本满足需求', date: '2026-01-18' }
    ]
  },
  {
    id: 'skill-002',
    name: 'AI 新闻收集器',
    description: '自动收集国内外 AI 公司新闻，保存到飞书多维表格，支持去重',
    category: 'AI 工具',
    tags: ['AI', '新闻', '飞书'],
    author: 'System',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    version: '1.0.0',
    versionHistory: [
      { version: '1.0.0', date: '2026-01-20', changes: '支持去重功能' },
      { version: '0.8.0', date: '2026-01-15', changes: '初始版本' }
    ],
    rating: 4.9,
    ratingCount: 89,
    downloadCount: 567,
    createdAt: '2026-01-20T14:30:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    status: 'published',
    config: {
      triggers: ['定时触发'],
      actions: ['收集新闻', '保存到表格']
    },
    prompt: '你是一个 AI 新闻收集助手。每天定时从各大科技媒体收集 AI 相关新闻，去重后保存到飞书多维表格。',
    parameters: [
      { name: 'keywords', type: 'array', required: true, description: '关注的关键词' },
      { name: 'sources', type: 'array', required: false, description: '新闻来源' }
    ],
    usageInstructions: '配置定时任务，每天自动执行',
    reviews: [
      { id: 'r3', user: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', rating: 5, comment: '非常实用！', date: '2026-01-25' }
    ]
  },
  {
    id: 'skill-003',
    name: '会议纪要生成',
    description: '从飞书会议中自动提取关键信息，生成结构化会议纪要',
    category: '效率工具',
    tags: ['会议', '纪要', '飞书'],
    author: 'System',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    version: '1.0.0',
    versionHistory: [
      { version: '1.0.0', date: '2026-02-01', changes: '初始版本' }
    ],
    rating: 4.5,
    ratingCount: 45,
    downloadCount: 234,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    status: 'published',
    config: {
      triggers: ['会议结束'],
      actions: ['生成纪要']
    },
    prompt: '你是一个会议纪要助手。当用户发送会议内容时，提取关键信息生成结构化纪要。',
    parameters: [
      { name: 'meetingContent', type: 'string', required: true, description: '会议内容' }
    ],
    usageInstructions: '在会议结束后，输入会议内容即可生成纪要',
    reviews: []
  },
  {
    id: 'skill-004',
    name: '代码审查助手',
    description: '自动审查代码，提供优化建议和安全问题检测',
    category: '开发工具',
    tags: ['代码', '审查', 'AI'],
    author: 'System',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    version: '1.2.0',
    versionHistory: [
      { version: '1.2.0', date: '2026-02-15', changes: '增加安全性检测' },
      { version: '1.1.0', date: '2026-02-10', changes: '优化性能建议' },
      { version: '1.0.0', date: '2026-02-05', changes: '初始版本' }
    ],
    rating: 4.7,
    ratingCount: 78,
    downloadCount: 456,
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
    status: 'published',
    config: {
      triggers: ['代码提交'],
      actions: ['代码审查']
    },
    reviews: []
  },
  {
    id: 'skill-005',
    name: '文档格式转换',
    description: '支持 Word、PDF、Markdown 等格式之间的相互转换',
    category: '效率工具',
    tags: ['文档', '转换', '格式'],
    author: 'System',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
    version: '1.0.0',
    versionHistory: [
      { version: '1.0.0', date: '2026-02-20', changes: '初始版本' }
    ],
    rating: 4.3,
    ratingCount: 32,
    downloadCount: 189,
    createdAt: '2026-02-20T15:00:00Z',
    updatedAt: '2026-02-20T15:00:00Z',
    status: 'published',
    config: {
      triggers: ['文件上传'],
      actions: ['格式转换']
    },
    reviews: []
  }
];

// Initialize skills file if not exists
const skillsFilePath = path.join(SKILLS_DIR, 'index.json');
if (!fs.existsSync(skillsFilePath)) {
  fs.writeFileSync(skillsFilePath, JSON.stringify(mockSkills, null, 2));
}

const skillService = {
  // Get all skills
  getAll: () => {
    const data = fs.readFileSync(skillsFilePath, 'utf-8');
    return JSON.parse(data);
  },

  // Get all categories
  getCategories: () => {
    const skills = skillService.getAll();
    const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];
    return categories.sort();
  },

  // Get all tags
  getTags: () => {
    const skills = skillService.getAll();
    const tags = [...new Set(skills.flatMap(s => s.tags || []))];
    return tags.sort();
  },

  // Search and filter skills
  search: ({ q, category, tag, sort = 'latest', page = 1, limit = 20 }) => {
    let skills = skillService.getAll();

    // Filter by published status for public store
    skills = skills.filter(s => s.status === 'published');

    // Keyword search
    if (q) {
      const keyword = q.toLowerCase();
      skills = skills.filter(s => 
        s.name.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(keyword)))
      );
    }

    // Category filter
    if (category) {
      skills = skills.filter(s => s.category === category);
    }

    // Tag filter
    if (tag) {
      skills = skills.filter(s => s.tags && s.tags.includes(tag));
    }

    // Sort
    switch (sort) {
      case 'popular':
        skills.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      case 'rating':
        skills.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'latest':
      default:
        skills.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
    }

    // Pagination
    const total = skills.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSkills = skills.slice(start, end);

    return {
      items: paginatedSkills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get skill by ID
  getById: (id) => {
    const skills = skillService.getAll();
    return skills.find(s => s.id === id);
  },

  // Create new skill
  create: (skillData) => {
    const skills = skillService.getAll();
    const newSkill = {
      id: `skill-${uuidv4().slice(0, 8)}`,
      ...skillData,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    skills.push(newSkill);
    fs.writeFileSync(skillsFilePath, JSON.stringify(skills, null, 2));
    return newSkill;
  },

  // Update skill
  update: (id, updates) => {
    const skills = skillService.getAll();
    const index = skills.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    skills[index] = {
      ...skills[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(skillsFilePath, JSON.stringify(skills, null, 2));
    return skills[index];
  },

  // Delete skill
  delete: (id) => {
    const skills = skillService.getAll();
    const filtered = skills.filter(s => s.id !== id);
    if (filtered.length === skills.length) return false;
    fs.writeFileSync(skillsFilePath, JSON.stringify(filtered, null, 2));
    return true;
  },

  // Add review
  addReview: (skillId, review) => {
    const skills = skillService.getAll();
    const index = skills.findIndex(s => s.id === skillId);
    if (index === -1) return null;
    
    if (!skills[index].reviews) {
      skills[index].reviews = [];
    }
    
    const newReview = {
      id: `r-${uuidv4().slice(0, 8)}`,
      ...review,
      date: new Date().toISOString().split('T')[0]
    };
    
    skills[index].reviews.push(newReview);
    skills[index].ratingCount = (skills[index].ratingCount || 0) + 1;
    
    // Recalculate rating
    const totalRating = skills[index].reviews.reduce((sum, r) => sum + r.rating, 0);
    skills[index].rating = Math.round((totalRating / skills[index].reviews.length) * 10) / 10;
    
    fs.writeFileSync(skillsFilePath, JSON.stringify(skills, null, 2));
    return newReview;
  }
};

module.exports = skillService;
