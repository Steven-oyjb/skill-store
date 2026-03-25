import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { skillService, Skill } from '../services/api'

// Star rating display
function StarRating({ rating, showValue = true }: { rating?: number; showValue?: boolean }) {
  const stars = Math.round(rating || 0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-lg ${star <= stars ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
      {showValue && rating !== undefined && (
        <span className="ml-1 font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}

// Version history item
function VersionHistoryItem({ version, date, changes }: { version: string; date: string; changes: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
          v{version}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{changes}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  )
}

// Review item
function ReviewItem({ review }: { review: { user: string; avatar?: string; rating: number; comment: string; date: string } }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start gap-3">
        <img 
          src={review.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user}`} 
          alt={review.user}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">{review.user}</span>
              <StarRating rating={review.rating} showValue={false} />
            </div>
            <span className="text-xs text-gray-400">{review.date}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  )
}

// Review form
function ReviewForm({ skillId, onSubmit }: { skillId: string; onSubmit: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    setSubmitting(true)
    try {
      await skillService.addReview(skillId, {
        user: '当前用户',
        rating,
        comment
      })
      setComment('')
      setRating(5)
      onSubmit()
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">发表评价</h4>
      
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">评分</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">评价内容</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="分享你的使用体验..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '提交中...' : '提交评价'}
      </button>
    </form>
  )
}

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info')

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

  const handleReviewSubmitted = () => {
    // Refresh skill data
    if (id) {
      skillService.getById(id).then(setSkill)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← 返回商店
      </Link>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {skill.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{skill.name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>👤 {skill.author}</span>
                  <span>📅 {new Date(skill.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">v{skill.version}</span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              skill.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {skill.status === 'published' ? '已发布' : '草稿'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-2">
              <StarRating rating={skill.rating} />
              <span className="text-sm text-gray-500">({skill.ratingCount || 0} 评价)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>📥</span>
              <span>{skill.downloadCount || 0} 次下载</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {skill.category}
            </span>
            {skill.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">简介</h2>
          <p className="text-gray-700 leading-relaxed">{skill.description}</p>
        </div>

        {/* Usage Instructions */}
        {skill.usageInstructions && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">使用说明</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{skill.usageInstructions}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'info' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              详细信息
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'reviews' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              用户评价 ({skill.reviews?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Prompt */}
              {skill.prompt && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prompt</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap max-h-60">
                    {skill.prompt}
                  </pre>
                </div>
              )}

              {/* Parameters */}
              {skill.parameters && skill.parameters.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">参数</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">参数名</th>
                          <th className="px-4 py-2 text-left font-medium">类型</th>
                          <th className="px-4 py-2 text-left font-medium">必填</th>
                          <th className="px-4 py-2 text-left font-medium">描述</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skill.parameters.map((param, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2 font-mono text-blue-600">{param.name}</td>
                            <td className="px-4 py-2 text-gray-600">{param.type}</td>
                            <td className="px-4 py-2">{param.required ? '✓' : '-'}</td>
                            <td className="px-4 py-2 text-gray-600">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Config */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">触发条件</h3>
                  <ul className="space-y-1">
                    {skill.config.triggers.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">执行动作</h3>
                  <ul className="space-y-1">
                    {skill.config.actions.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Version History */}
              {skill.versionHistory && skill.versionHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">版本历史</h3>
                  <div className="space-y-0">
                    {skill.versionHistory.map((vh, idx) => (
                      <VersionHistoryItem key={idx} {...vh} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Review Form */}
              <ReviewForm skillId={skill.id} onSubmit={handleReviewSubmitted} />
              
              {/* Reviews List */}
              {skill.reviews && skill.reviews.length > 0 ? (
                <div className="space-y-3">
                  {skill.reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">暂无评价，快来抢先评价吧！</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2">
              <span>📥</span>
              下载 / 使用
            </button>
            <Link 
              to={`/skills/${id}/edit`} 
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors inline-block"
            >
              编辑
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
