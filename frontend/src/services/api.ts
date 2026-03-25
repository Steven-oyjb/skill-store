const API_BASE = '/api'

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  author: string
  version: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
  config: {
    triggers: string[]
    actions: string[]
  }
}

export const skillService = {
  getAll: async (): Promise<Skill[]> => {
    const res = await fetch(`${API_BASE}/skills`)
    const data = await res.json()
    return data.data
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
  }
}

export const userService = {
  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/users/me`)
    const data = await res.json()
    return data.data
  }
}
