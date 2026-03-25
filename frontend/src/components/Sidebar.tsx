import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { userService, type User } from '../services/api'

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    userService.getCurrentUser().then(setUser).catch(console.error)
  }, [])

  const isAdmin = user?.role === 'admin'

  const menuItems = [
    { path: '/', label: '🏠 首页', exact: true },
    { path: '/create', label: '➕ 创建 Skill' },
    { path: '/profile', label: '👤 个人中心' },
  ]

  const adminItems = [
    { path: '/admin', label: '🔧 管理后台' },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {isAdmin && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            管理员
          </h3>
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </aside>
  )
}
