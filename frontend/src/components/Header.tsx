import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { userService, type User } from '../services/api'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    userService.getCurrentUser().then(setUser).catch(console.error)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-gray-900">
            🎯 Skill 商店
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建 Skill
          </Link>
          <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-gray-700">
              {user?.name || '用户'} 
              {user?.role === 'admin' && <span className="ml-1 text-purple-600">(Admin)</span>}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
