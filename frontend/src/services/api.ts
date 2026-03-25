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

export interface User {
  id: string
  openId: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  department?: string
  bio?: string
  createdAt: string
}

export interface UsageHistory {
  id: string
  skillId: string
  skillName: string
  usedAt: string
  result: string
}

export interface AdminStats {
  totalSkills: number
  publishedSkills: number
  draftSkills: number
  totalUsers: number
  activeUsers: number
  totalDownloads: number
  totalRatings: number
  avgRating: number
  pendingReviews: number
  monthlyDownloads: Array<{ month: string; downloads: number }>
  categoryDistribution: Array<{ category: string; count: number }>
}

export interface PendingReview {
  id: string
  skillId: string
  skillName: string
  description: string
  category: string
  tags: string[]
  applicant: string
  applicantId: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ReviewHistory {
  id: string
  skillId: string
  skillName: string
  reviewer: string
  result: 'approved' | 'rejected'
  reason?: string
  reviewedAt: string
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

  getCategories: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/skills/categories`)
    const data = await res.json()
    return data.data
  },

  getTags: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/skills/tags`)
    const data = await res.json()
    return data.data
  },

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
  generateQuestions: async (userInput: string): Promise<Question[]> => {
    const res = await fetch(`${API_BASE}/ai/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    })
    const data = await res.json()
    return data.data
  },

  generateFramework: async (userInput: string, answers: Record<string, string>): Promise<Framework> => {
    const res = await fetch(`${API_BASE}/ai/framework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, answers }),
    })
    const data = await res.json()
    return data.data
  },

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
  getCurrentUser: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me`)
    const data = await res.json()
    return data.data
  },

  updateCurrentUser: async (updates: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    return data.data
  },

  getMySkills: async (): Promise<Skill[]> => {
    const res = await fetch(`${API_BASE}/users/me/skills`)
    const data = await res.json()
    return data.data
  },

  getMyDownloads: async (): Promise<Skill[]> => {
    const res = await fetch(`${API_BASE}/users/me/downloads`)
    const data = await res.json()
    return data.data
  },

  getMyUsage: async (): Promise<UsageHistory[]> => {
    const res = await fetch(`${API_BASE}/users/me/usage`)
    const data = await res.json()
    return data.data
  }
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await fetch(`${API_BASE}/admin/stats`)
    const data = await res.json()
    return data.data
  },

  getPendingReviews: async (): Promise<PendingReview[]> => {
    const res = await fetch(`${API_BASE}/admin/pending`)
    const data = await res.json()
    return data.data
  },

  getReviewHistory: async (): Promise<ReviewHistory[]> => {
    const res = await fetch(`${API_BASE}/admin/reviews`)
    const data = await res.json()
    return data.data
  },

  reviewSkill: async (reviewId: string, action: 'approve' | 'reject', reason?: string): Promise<PendingReview> => {
    const res = await fetch(`${API_BASE}/admin/review/${reviewId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    })
    const data = await res.json()
    return data.data
  },

  getPublishedSkills: async (): Promise<Skill[]> => {
    const res = await fetch(`${API_BASE}/admin/published`)
    const data = await res.json()
    return data.data
  },

  togglePublish: async (skillId: string, action: 'publish' | 'unpublish'): Promise<Skill> => {
    const res = await fetch(`${API_BASE}/admin/skills/${skillId}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    return data.data
  },

  getAllSkills: async (status?: string): Promise<Skill[]> => {
    const queryParams = new URLSearchParams()
    if (status) queryParams.set('status', status)
    const res = await fetch(`${API_BASE}/admin/skills?${queryParams.toString()}`)
    const data = await res.json()
    return data.data
  }
}
