import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type AdminStats, type PendingReview, type Skill, type ReviewHistory } from '../services/api'

type TabType = 'stats' | 'pending' | 'published' | 'reviews'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pending, setPending] = useState<PendingReview[]>([])
  const [published, setPublished] = useState<Skill[]>([])
  const [reviews, setReviews] = useState<ReviewHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ show: boolean; id: string; reason: string }>({
    show: false,
    id: '',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, pendingData, publishedData, reviewsData] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingReviews(),
        adminService.getPublishedSkills(),
        adminService.getReviewHistory()
      ])
      setStats(statsData)
      setPending(pendingData)
      setPublished(publishedData)
      setReviews(reviewsData)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    setReviewingId(reviewId)
    try {
      await adminService.reviewSkill(reviewId, 'approve')
      await loadData()
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setReviewingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) return
    setReviewingId(rejectModal.id)
    try {
      await adminService.reviewSkill(rejectModal.id, 'reject', rejectModal.reason)
      setRejectModal({ show: false, id: '', reason: '' })
      await loadData()
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setReviewingId(null)
    }
  }

  const handleTogglePublish = async (skillId: string, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish'
    try {
      await adminService.togglePublish(skillId, action)
      await loadData()
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔧 管理后台</h1>
        <p className="text-gray-500 mt-1">管理系统和审核申请</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'stats', label: '📊 数据统计', count: 0 },
              { key: 'pending', label: '⏳ 待审核', count: pending.length },
              { key: 'published', label: '📦 已发布', count: published.length },
              { key: 'reviews', label: '📝 审核记录', count: reviews.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.totalSkills}</div>
                <div className="text-blue-100 mt-1">Skill 总数</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.publishedSkills}</div>
                <div className="text-green-100 mt-1">已发布</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <div className="text-purple-100 mt-1">注册用户</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.totalDownloads}</div>
                <div className="text-orange-100 mt-1">总下载量</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">📈 月度下载量</h3>
                <div className="space-y-3">
                  {stats.monthlyDownloads.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.downloads / 600) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.downloads}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">📂 分类分布</h3>
                <div className="space-y-3">
                  {stats.categoryDistribution.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(item.count / 20) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">📋 其他数据</h3>
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-600">草稿数量</span><span className="font-medium text-gray-900">{stats.draftSkills}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">活跃用户</span><span className="font-medium text-gray-900">{stats.activeUsers}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">总评分次数</span><span className="font-medium text-gray-900">{stats.totalRatings}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">平均评分</span><span className="font-medium text-gray-900">⭐ {stats.avgRating}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">待审核</span><span className="font-medium text-red-600">{stats.pendingReviews}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Reviews Tab */}
        {activeTab === 'pending' && (
          <div className="p-6">
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900">暂无待审核</h3>
                <p className="text-gray-500 mt-1">所有申请已处理完毕</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{item.skillName}</h3>
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">待审核</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span>📁 {item.category}</span>
                          <span>👤 申请人: {item.applicant}</span>
                          <span>📅 申请于 {item.appliedAt.split('T')[0]}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button onClick={() => handleApprove(item.id)} disabled={reviewingId === item.id} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                          {reviewingId === item.id ? '处理中...' : '✅ 通过'}
                        </button>
                        <button onClick={() => setRejectModal({ show: true, id: item.id, reason: '' })} disabled={reviewingId === item.id} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                          ❌ 拒绝
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Published Tab */}
        {activeTab === 'published' && (
          <div className="p-6">
            {published.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900">暂无已发布</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Skill 名称</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">作者</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">版本</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">下载量</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">评分</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {published.map((skill) => (
                      <tr key={skill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4"><Link to={`/skills/${skill.id}`} className="text-blue-600 hover:underline">{skill.name}</Link></td>
                        <td className="py-3 px-4 text-gray-600">{skill.category}</td>
                        <td className="py-3 px-4 text-gray-600">{skill.author}</td>
                        <td className="py-3 px-4 text-gray-600">v{skill.version}</td>
                        <td className="py-3 px-4 text-gray-600">{skill.downloadCount || 0}</td>
                        <td className="py-3 px-4 text-gray-600">{skill.rating ? `⭐ ${skill.rating}` : '-'}</td>
                        <td className="py-3 px-4"><button onClick={() => handleTogglePublish(skill.id, skill.status)} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">下架</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews History Tab */}
        {activeTab === 'reviews' && (
          <div className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900">暂无审核记录</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${review.result === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {review.result === 'approved' ? '✅' : '❌'}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{review.skillName}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded ${review.result === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {review.result === 'approved' ? '已通过' : '已拒绝'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        审核人: {review.reviewer} · {review.reviewedAt.split('T')[0]}
                        {review.reason && <span className="ml-2">· 原因: {review.reason}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">拒绝申请</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="请输入拒绝原因..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={() => setRejectModal({ show: false, id: '', reason: '' })} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={handleReject} disabled={
!rejectModal.reason.trim() || reviewingId !== null} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {reviewingId ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
