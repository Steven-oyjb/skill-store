const express = require('express');
const router = express.Router();
const skillService = require('../services/skillService');

// Mock current user - in real app would come from session/token
const getCurrentUser = () => ({
  id: 'user-001',
  openId: 'ou_test001',
  name: '张三',
  email: 'zhangsan@company.com',
  role: 'admin', // Change to 'user' to test non-admin
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
  department: '技术部',
  bio: '热爱 AI 和自动化',
  createdAt: '2026-01-01T00:00:00Z'
});

// Mock user data storage
const userDownloads = [
  { skillId: 'skill-001', downloadedAt: '2026-03-01T10:00:00Z' },
  { skillId: 'skill-002', downloadedAt: '2026-03-05T14:30:00Z' },
  { skillId: 'skill-003', downloadedAt: '2026-03-10T09:15:00Z' }
];

const usageHistory = [
  { id: 'usage-001', skillId: 'skill-001', skillName: '飞书任务创建', usedAt: '2026-03-15T10:00:00Z', result: '成功创建任务' },
  { id: 'usage-002', skillId: 'skill-002', skillName: 'AI 新闻收集器', usedAt: '2026-03-14T08:00:00Z', result: '收集 12 条新闻' },
  { id: 'usage-003', skillId: 'skill-003', skillName: '会议纪要生成', usedAt: '2026-03-13T15:30:00Z', result: '生成纪要成功' },
  { id: 'usage-004', skillId: 'skill-001', skillName: '飞书任务创建', usedAt: '2026-03-12T11:20:00Z', result: '成功创建任务' }
];

// Mock pending reviews
let pendingReviews = [
  { id: 'review-001', skillId: 'skill-006', skillName: '企业微信集成', applicant: '李四', appliedAt: '2026-03-20T10:00:00Z', status: 'pending' },
  { id: 'review-002', skillId: 'skill-007', skillName: 'PDF 转 Word', applicant: '王五', appliedAt: '2026-03-18T14:30:00Z', status: 'pending' }
];

// GET /api/users/me - Get current user
router.get('/me', (req, res) => {
  const user = getCurrentUser();
  res.json({ success: true, data: user });
});

// PUT /api/users/me - Update current user
router.put('/me', (req, res) => {
  const user = getCurrentUser();
  const updatedUser = { ...user, ...req.body };
  res.json({ success: true, data: updatedUser });
});

// GET /api/users/me/skills - Get skills created by current user
router.get('/me/skills', (req, res) => {
  const user = getCurrentUser();
  const skills = skillService.getAll();
  // Filter skills by author (in real app would use user.id)
  const userSkills = skills.filter(s => s.author === user.name || s.author === 'System');
  res.json({ success: true, data: userSkills });
});

// GET /api/users/me/downloads - Get downloaded skills
router.get('/me/downloads', (req, res) => {
  const user = getCurrentUser();
  const skills = skillService.getAll();
  const downloadedSkills = userDownloads.map(d => {
    const skill = skills.find(s => s.id === d.skillId);
    return skill ? { ...skill, downloadedAt: d.downloadedAt } : null;
  }).filter(Boolean);
  res.json({ success: true, data: downloadedSkills });
});

// GET /api/users/me/usage - Get usage history
router.get('/me/usage', (req, res) => {
  const user = getCurrentUser();
  // Filter by user
  const history = usageHistory.filter(u => u.id.startsWith('usage'));
  res.json({ success: true, data: history });
});

// GET /api/users - Get all users (for admin)
router.get('/', (req, res) => {
  const mockUsers = [
    { id: 'user-001', openId: 'ou_test001', name: '张三', email: 'zhangsan@company.com', role: 'admin', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'user-002', openId: 'ou_test002', name: '李四', email: 'lisi@company.com', role: 'user', createdAt: '2026-01-15T00:00:00Z' },
    { id: 'user-003', openId: 'ou_test003', name: '王五', email: 'wangwu@company.com', role: 'user', createdAt: '2026-02-01T00:00:00Z' }
  ];
  res.json({ success: true, data: mockUsers });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const mockUsers = [
    { id: 'user-001', openId: 'ou_test001', name: '张三', email: 'zhangsan@company.com', role: 'admin' },
    { id: 'user-002', openId: 'ou_test002', name: '李四', email: 'lisi@company.com', role: 'user' }
  ];
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
});

module.exports = router;
