import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { skillService, Skill, SearchParams } from '../services/api'

// Star rating component
function StarRating({ rating, count }: { rating?: number; count?: number }) {
  const stars = Math.round(rating || 0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= stars ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
      {count !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  )
}

// Category filter pills
function CategoryPills({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: string[] 
  selected: string 
  onSelect: (cat: string | null) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          !selected 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === cat 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

// Tag filter
function TagFilter({ 
  tags, 
  selected, 
  onSelect 
}: { 
  tags: string[] 
  selected: string 
  onSelect: (tag: string | null) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayTags = isExpanded ? tags : tags.slice(0, 8)
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500">标签:</span>
      <button
        onClick={() => onSelect(null)}
        className={`px-2 py-1 text-xs rounded ${
          !selected 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {displayTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            selected === tag 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
      {tags.length > 8 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? '收起' : `展开更多(${tags.length - 8})`}
        </button>
      )}
    </div>
  )
}

// Sort dropdown
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="latest">最新上架</option>
      <option value="popular">最受欢迎</option>
      <option value="rating">评分最高</option>
    </select>
  )
}

// Skill card component
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      to={`/skills/${skill.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {skill.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{skill.name}</h3>
            <p className="text-xs text-gray-500">v{skill.version}</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          已发布
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {skill.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <StarRating rating={skill.rating} count={skill.ratingCount} />
        </div>
        <div className="flex items-center gap-3">
          <span>📥 {skill.downloadCount || 0}</span>
          <span>{skill.category}</span>
        </div>
      </div>
    </Link>
  )
}

// Section component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('latest')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  // Fetch filters data
  useEffect(() => {
    Promise.all([
      skillService.getCategories(),
      skillService.getTags()
    ]).then(([cats, tgs]) => {
      setCategories(cats)
      setTags(tgs)
    })
  }, [])

  // Fetch skills with filters
  const fetchSkills = useCallback(async () => {
    setLoading(true)
    try {
      const params: SearchParams = {
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        tag: selectedTag || undefined,
        sort: sortBy as 'latest' | 'popular' | 'rating',
        page: pagination.page,
        limit: 12
      }
      const result = await skillService.search(params)
      setSkills(result.items)
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }))
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedTag, sortBy, pagination.page])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSkills()
  }

  // Handle filter changes
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Get popular and latest skills for sections
  const popularSkills = skills.slice(0, 4)
  const latestSkills = skills.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Skill 商店</h1>
        <p className="text-gray-600">发现并使用高效的 AI Skills</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 Skills..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            搜索
          </button>
        </div>
      </form>

      {/* Category Navigation */}
      <div className="mb-6">
        <CategoryPills 
          categories={categories}
          selected={selectedCategory || ''}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Tag Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <TagFilter 
          tags={tags}
          selected={selectedTag || ''}
          onSelect={handleTagChange}
        />
      </div>

      {/* Sort and Results */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          共 {pagination.total} 个 Skills
        </p>
        <SortDropdown value={sortBy} onChange={handleSortChange} />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      ) : (
        <>
          {/* Popular Section */}
          {(!searchQuery && !selectedCategory && !selectedTag) && (
            <Section title="🔥 热门推荐">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </Section>
          )}

          {/* Latest Section */}
          {(!searchQuery && !selectedCategory && !selectedTag) && (
            <Section title="✨ 最新上架">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </Section>
          )}

          {/* All Skills Grid */}
          <Section title={selectedCategory || selectedTag || searchQuery ? '搜索结果' : '📚 全部 Skills'}>
            {skills.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">没有找到匹配的 Skills</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </Section>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-gray-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
