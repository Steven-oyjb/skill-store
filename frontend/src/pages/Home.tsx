import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { skillService, Skill } from '../services/api'

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    skillService.getAll()
      .then(data => {
        setSkills(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-10">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Skill 商店</h1>
      
      <div className="mb-6">
        <input
          type="search"
          placeholder="搜索 Skills..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Link
            key={skill.id}
            to={`/skills/${skill.id}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{skill.name}</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                skill.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {skill.status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
            <div className="flex flex-wrap gap-1">
              {skill.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
