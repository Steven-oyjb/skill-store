const API_BASE = '/api'

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  author: string
  authorAvatar?: string
  version: string
  versionHistory?: Array<{
    version: string
    date: string
    changes: string
  }>
  rating?: number
  ratingCount?: number
  downloadCount?: number
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
  config: {
    triggers: string[]
    actions: string[]
  }
  prompt?: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  usageInstructions?: string
  reviews?: Array<{
    id: string
    user: string
    avatar?: string
    rating: number
    comment: string
    date: string
  }>
}

export interface SearchParams {
  q?: string
  category?: string
  tag?: string
  sort?: 'latest' | 'popular' | 'rating'
  page?: number
  limit?: number
}

export interface SearchResult {
  items: Skill[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Question {
  question: string
  options: string[]
  key: string
}

export interface Framework {
  name: string
  description: string
  category: string
  tags: string[]
  config: {
    triggers: string[]
    actions: string[]
  }
  prompt: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
}

export const skillService = {
  // Search skills with filters
  search: async (params: SearchParams): Promise<SearchResult> => {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.set('q', params.q)
    if (params.category) queryParams.set('category', params.category)
    if (params.tag) queryParams.set('tag', params.tag)
    if (params.sort) queryParams.set('sort', params.sort)
    if (params.page) queryParams.set('page', String(params.page))
    if (params.limit) queryParams.set('limit', String(params.limit))
    
    const res = await fetch(`${API_BASE}/skills?${queryParams.toString()}`)
    const data = await res.json()
    return data.data
  },

  // Get all skills (legacy)
  getAll: async (): Promise<Skill[]> => {
    const res = await fetch(`${API_BASE}/skills`)
    const data = await res.json()
    return data.data.items || data.data
  },

  getById: async (id: string): Promise<Skill> => {
    const res = await fetch(`${API_BASE}/skills/${id}`)
    const data = await res.json()
    return data.data
  },

  create: async (skill: Partial<Skill>): Promise<Skill> => {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill),
    })
    const data = await res.json()
    return data.data
  },

  update: async (id: string, updates: Partial<Skill>): Promise<Skill> => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/skills/${id}`, { method: 'DELETE' })
  },

  publish: async (id: string, scope: 'public' | 'private'): Promise<Skill> => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published', scope }),
    })
    const data = await res.json()
    return data.data
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/skills/categories`)
    const data = await res.json()
    return data.data
  },

  // Get tags
  getTags: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/skills/tags`)
    const data = await res.json()
    return data.data
  },

  // Add review
  addReview: async (skillId: string, review: { user: string; rating: number; comment: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/skills/${skillId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    })
    const data = await res.json()
    return data.data
  }
}

export const aiService = {
  // 生成选择题
  generateQuestions: async (userInput: string): Promise<Question[]> => {
    const res = await fetch(`${API_BASE}/ai/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    })
    const data = await res.json()
    return data.data
  },

  // 生成 Skill 框架
  generateFramework: async (userInput: string, answers: Record<string, string>): Promise<Framework> => {
    const res = await fetch(`${API_BASE}/ai/framework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, answers }),
    })
    const data = await res.json()
    return data.data
  },

  // 测试 Skill
  testSkill: async (prompt: string, parameters: Record<string, any>): Promise<{ result: string }> => {
    const res = await fetch(`${API_BASE}/ai/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, parameters }),
    })
    const data = await res.json()
    return data.data
  }
}

export const userService = {
  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/users/me`)
    const data = await res.json()
    return data.data
  }
}
