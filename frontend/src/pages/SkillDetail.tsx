import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { skillService, Skill } from '../services/api'

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      skillService.getById(id)
        .then(data => {
          setSkill(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return <div className="text-center py-10">加载中...</div>
  }

  if (!skill) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Skill 不存在</p>
        <Link to="/" className="text-blue-600 hover:underline">返回首页</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">← 返回</Link>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{skill.name}</h1>
            <p className="text-sm text-gray-500">作者: {skill.author} · 版本: {skill.version}</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded ${
            skill.status === 'published' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {skill.status === 'published' ? '已发布' : '草稿'}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{skill.description}</p>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">分类</h3>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">{skill.category}</span>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">标签</h3>
          <div className="flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">触发条件</h3>
          <ul className="list-disc list-inside text-gray-700">
            {skill.config.triggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">执行动作</h3>
          <ul className="list-disc list-inside text-gray-700">
            {skill.config.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            使用此 Skill
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            编辑
          </button>
        </div>
      </div>
    </div>
  )
}
