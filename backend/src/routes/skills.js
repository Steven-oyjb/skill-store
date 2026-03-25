const express = require('express');
const router = express.Router();
const skillService = require('../services/skillService');

// GET /api/skills - Get all skills with search and filters
router.get('/', (req, res) => {
  try {
    const { q, category, tag, sort, page = 1, limit = 20 } = req.query;
    const result = skillService.search({
      q,
      category,
      tag,
      sort,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/skills/categories - Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = skillService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/skills/tags - Get all tags
router.get('/tags', (req, res) => {
  try {
    const tags = skillService.getTags();
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/skills/:id - Get single skill
router.get('/:id', (req, res) => {
  try {
    const skill = skillService.getById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/skills - Create new skill
router.post('/', (req, res) => {
  try {
    const skill = skillService.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/skills/:id - Update skill
router.put('/:id', (req, res) => {
  try {
    const skill = skillService.update(req.params.id, req.body);
    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/skills/:id - Delete skill
router.delete('/:id', (req, res) => {
  try {
    const success = skillService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/skills/:id/reviews - Add review
router.post('/:id/reviews', (req, res) => {
  try {
    const review = skillService.addReview(req.params.id, req.body);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
