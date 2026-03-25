const express = require('express');
const router = express.Router();

// Mock users data
const mockUsers = [
  {
    id: 'user-001',
    openId: 'ou_test001',
    name: '张三',
    email: 'zhangsan@company.com',
    role: 'admin',
    avatar: ''
  },
  {
    id: 'user-002',
    openId: 'ou_test002',
    name: '李四',
    email: 'lisi@company.com',
    role: 'user',
    avatar: ''
  }
];

// Current logged in user (mock)
const currentUser = {
  id: 'user-001',
  openId: 'ou_test001',
  name: '张三',
  email: 'zhangsan@company.com',
  role: 'admin',
  avatar: ''
};

// GET /api/users/me - Get current user
router.get('/me', (req, res) => {
  res.json({ success: true, data: currentUser });
});

// GET /api/users - Get all users (for admin)
router.get('/', (req, res) => {
  res.json({ success: true, data: mockUsers });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
});

module.exports = router;
