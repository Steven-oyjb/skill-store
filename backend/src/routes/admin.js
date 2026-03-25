const express = require('express');
const router = express.Router();
const skillService = require('../services/skillService');

// Mock pending reviews data
let pendingReviews = [
  { 
    id: 'review-001', 
    skillId: 'skill-006', 
    skillName: '企业微信集成', 
    description: '支持企业微信的日程、审批、通讯录等功能的集成',
    category: '飞书集成',
    tags: ['企业微信', '日程', '审批'],
    applicant: '李四',
    applicantId: 'user-002',
    appliedAt: '2026-03-20T10:00:00Z', 
    status: 'pending' 
  },
  { 
    id: 'review-002', 
    skillId: 'skill-007', 
    skillName: 'PDF 转 Word', 
    description: '将 PDF 文档转换为可编辑的 Word 格式',
    category: '效率工具',
    tags: ['PDF', '转换', '文档'],
    applicant: '王五',
    applicantId: 'user-003',
    appliedAt: '2026-03-18T14:30:00Z', 
    status: 'pending' 
  },
  { 
    id: 'review-003', 
    skillId: 'skill-008', 
    skillName: '智能客服机器人', 
    description: '基于 AI 的智能客服，支持多轮对话和知识库问答',
    category: 'AI 工具',
    tags: ['AI', '客服', '机器人'],
    applicant: '赵六',
    applicantId: 'user-004',
    appliedAt: '2026-03-15T09:00:00Z', 
    status: 'pending' 
  }
];

// Mock users
const mockUsers = [
  { id: 'user-001', name: '张三', role: 'admin' },
  { id: 'user-002', name: '李四', role: 'user' },
  { id: 'user-003', name: '王五', role: 'user' },
  { id: 'user-004', name: '赵六', role: 'user' }
];

// Mock reviews history
const reviewsHistory = [
  { id: 'review-hist-001', skillId: 'skill-001', skillName: '飞书任务创建', reviewer: '张三', result: 'approved', reviewedAt: '2026-01-15T10:00:00Z' },
  { id: 'review-hist-002', skillId: 'skill-002', skillName: 'AI 新闻收集器', reviewer: '张三', result: 'approved', reviewedAt: '2026-01-20T14:30:00Z' },
  { id: 'review-hist-003', skillId: 'skill-004', skillName: '代码审查助手', reviewer: '张三', result: 'approved', reviewedAt: '2026-02-15T11:00:00Z' },
  { id: 'review-hist-004', skillId: 'skill-reject-001', skillName: '测试 Skill', reviewer: '张三', result: 'rejected', reason: '功能描述不清晰', reviewedAt: '2026-02-10T09:00:00Z' }
];

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  // In real app, would check user role from session/token
  // For mock, we assume user-001 is admin
  const userId = req.headers['x-user-id'] || 'user-001';
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// GET /api/admin/stats - Get statistics (admin only)
router.get('/stats', requireAdmin, (req, res) => {
  const skills = skillService.getAll();
  
  const stats = {
    totalSkills: skills.length,
    publishedSkills: skills.filter(s => s.status === 'published').length,
    draftSkills: skills.filter(s => s.status === 'draft').length,
    totalUsers: mockUsers.length,
    activeUsers: 45, // Mock data
    totalDownloads: skills.reduce((sum, s) => sum + (s.downloadCount || 0), 0),
    totalRatings: skills.reduce((sum, s) => sum + (s.ratingCount || 0), 0),
    avgRating: 4.6, // Mock average
    pendingReviews: pendingReviews.filter(r => r.status === 'pending').length,
    monthlyDownloads: [
      { month: '2026-01', downloads: 320 },
      { month: '2026-02', downloads: 456 },
      { month: '2026-03', downloads: 589 }
    ],
    categoryDistribution: [
      { category: '飞书集成', count: 12 },
      { category: 'AI 工具', count: 8 },
      { category: '效率工具', count: 15 },
      { category: '开发工具', count: 6 },
      { category: '其他', count: 4 }
    ]
  };
  
  res.json({ success: true, data: stats });
});

// GET /api/admin/pending - Get pending review list (admin only)
router.get('/pending', requireAdmin, (req, res) => {
  const pending = pendingReviews.filter(r => r.status === 'pending');
  res.json({ success: true, data: pending });
});

// GET /api/admin/reviews - Get all reviews history (admin only)
router.get('/reviews', requireAdmin, (req, res) => {
  res.json({ success: true, data: reviewsHistory });
});

// POST /api/admin/review/:id - Review a skill (approve/reject) (admin only)
router.post('/review/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'approve' | 'reject'
  
  const review = pendingReviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }
  
  // Update review status
  review.status = action === 'approve' ? 'approved' : 'rejected';
  review.reviewedAt = new Date().toISOString();
  review.reviewer = '张三';
  if (reason) review.reason = reason;
  
  // If approved, update skill status
  if (action === 'approve') {
    skillService.update(review.skillId, { status: 'published' });
  }
  
  // Add to history
  reviewsHistory.unshift({
    id: `review-hist-${Date.now()}`,
    skillId: review.skillId,
    skillName: review.skillName,
    reviewer: '张三',
    result: action === 'approve' ? 'approved' : 'rejected',
    reason: reason,
    reviewedAt: review.reviewedAt
  });
  
  res.json({ success: true, data: review });
});

// GET /api/admin/published - Get published skills list (admin only)
router.get('/published', requireAdmin, (req, res) => {
  const skills = skillService.getAll();
  const published = skills.filter(s => s.status === 'published');
  res.json({ success: true, data: published });
});

// PUT /api/admin/skills/:id/publish - Publish/unpublish skill (admin only)
router.put('/skills/:id/publish', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // action: 'publish' | 'unpublish'
  
  const skill = skillService.getById(id);
  if (!skill) {
    return res.status(404).json({ success: false, error: 'Skill not found' });
  }
  
  const newStatus = action === 'publish' ? 'published' : 'draft';
  const updated = skillService.update(id, { status: newStatus });
  
  res.json({ success: true, data: updated });
});

// GET /api/admin/skills - Get all skills with filters (admin only)
router.get('/skills', requireAdmin, (req, res) => {
  const { status } = req.query;
  let skills = skillService.getAll();
  
  if (status) {
    skills = skills.filter(s => s.status === status);
  }
  
  res.json({ success: true, data: skills });
});

module.exports = router;
