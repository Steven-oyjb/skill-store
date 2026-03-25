import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService, type User, type UsageHistory, type Skill } from '../services/api'

type TabType = 'skills' | 'downloads' | 'usage' | 'profile'

type DownloadedSkill = Skill & { downloadedAt?: string }

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('skills')
  const [user, setUser] = useState<User | null>(null)
  const [mySkills, setMySkills] = useState<Skill[]>([])
  const [downloads, setDownloads] = useState<DownloadedSkill[]>([])
  const [usage, setUsage] = useState<UsageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', department: '', bio: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userData, skillsData, downloadsData, usageData] = await Promise.all([
        userService.getCurrentUser(),
        userService.getMySkills(),
        userService.getMyDownloads(),
        userService.getMyUsage()
      ])
      setUser(userData)
      setMySkills(skillsData)
      setDownloads(downloadsData)
      setUsage(usageData)
      setEditForm({
        name: userData.name,
        department: userData.department || '',
        bio: userData.bio || ''
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const updated = await userService.updateCurrentUser(editForm)
      setUser(updated)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update:', error)
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
    <div className="max-w-6xl mx-auto">
      {/* User Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role === 'admin' ? '超级管理员' : '普通用户'}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{user?.email}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>📁 {user?.department || '未设置部门'}</span>
              <span>📅 加入于 {user?.createdAt?.split('T')[0]}</span>
            </div>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              editing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {editing ? '保存' : '编辑资料'}
          </button>
        </div>

        {editing && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
              <input
                type="text"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'skills', label: '🎯 我的 Skills', count: mySkills.length },
              { key: 'downloads', label: '⬇️ 已下载', count: downloads.length },
              { key: 'usage', label: '📊 使用历史', count: usage.length },
              { key: 'profile', label: '👤 基本信息', count: 0 }
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
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* My Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {mySkills.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900">还没有创建任何 Skill</h3>
                  <p className="text-gray-500 mt-1">创建你的第一个 Skill 开始吧</p>
                  <Link
                    to="/create"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    创建 Skill
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mySkills.map((skill) => (
                    <Link
                      key={skill.id}
                      to={`/skills/${skill.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          skill.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {skill.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>v{skill.version}</span>
                        <span>⬇️ {skill.downloadCount || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Downloads Tab */}
          {activeTab === 'downloads' && (
            <div>
              {downloads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900">还没有下载任何 Skill</h3>
                  <p className="text-gray-500 mt-1">去商店发现更多有用的 Skill</p>
                  <Link
                    to="/"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    浏览商店
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloads.map((skill) => (
                    <Link
                      key={skill.id}
                      to={`/skills/${skill.id}`}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {skill.name.charAt(0)}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-500">{skill.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          下载于 {skill.downloadedAt?.split('T')[0]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage History Tab */}
          {activeTab === 'usage' && (
            <div>
              {usage.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900">暂无使用记录</h3>
                  <p className="text-gray-500 mt-1">开始使用 Skills 后会显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usage.map((item) => (
                    <div key={item.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        ⚡
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{item.skillName}</h3>
                        <p className="text-sm text-gray-500">{item.result}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {item.usedAt.split('T')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">姓名</h3>
                    <p className="text-sm text-gray-500">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">邮箱</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">部门</h3>
                    <p className="text-sm text-gray-500">{user?.department || '未设置'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">个人简介</h3>
                    <p className="text-sm text-gray-500">{user?.bio || '暂无简介'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">角色</h3>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'admin' ? '超级管理员' : '普通用户'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
