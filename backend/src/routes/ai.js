const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/questions - 生成选择题
router.post('/questions', async (req, res) => {
  try {
    const { userInput } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    const questions = await aiService.generateQuestions(userInput);
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/framework - 生成 Skill 框架
router.post('/framework', async (req, res) => {
  try {
    const { userInput, answers } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'userInput is required' 
      });
    }
    
    const framework = await aiService.generateFramework(userInput, answers || {});
    res.json({ success: true, data: framework });
  } catch (error) {
    console.error('Generate framework error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/test - 测试 Skill
router.post('/test', async (req, res) => {
  try {
    const { prompt, parameters } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'prompt is required' 
      });
    }
    
    // 这里可以调用 AI 来测试 Skill 的输出
    // 目前返回模拟结果
    res.json({ 
      success: true, 
      data: {
        result: `测试输出：已接收到参数 ${JSON.stringify(parameters)}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Test skill error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
