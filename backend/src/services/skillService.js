const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SKILLS_DIR = path.join(__dirname, '../../skills');

// Ensure skills directory exists
if (!fs.existsSync(SKILLS_DIR)) {
  fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

// Mock skill data
const mockSkills = [
  {
    id: 'skill-001',
    name: '飞书任务创建',
    description: '快速创建飞书任务，支持设置负责人、截止时间、提醒等',
    category: '飞书集成',
    tags: ['飞书', '任务', '自动化'],
    author: 'System',
    version: '1.0.0',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    status: 'published',
    config: {
      triggers: ['关键词触发'],
      actions: ['创建飞书任务']
    }
  },
  {
    id: 'skill-002',
    name: 'AI 新闻收集器',
    description: '自动收集国内外 AI 公司新闻，保存到飞书多维表格，支持去重',
    category: 'AI 工具',
    tags: ['AI', '新闻', '飞书'],
    author: 'System',
    version: '1.0.0',
    createdAt: '2026-01-20T14:30:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    status: 'published',
    config: {
      triggers: ['定时触发'],
      actions: ['收集新闻', '保存到表格']
    }
  },
  {
    id: 'skill-003',
    name: '会议纪要生成',
    description: '从飞书会议中自动提取关键信息，生成结构化会议纪要',
    category: '效率工具',
    tags: ['会议', '纪要', '飞书'],
    author: 'System',
    version: '1.0.0',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    status: 'draft',
    config: {
      triggers: ['会议结束'],
      actions: ['生成纪要']
    }
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
  }
};

module.exports = skillService;
