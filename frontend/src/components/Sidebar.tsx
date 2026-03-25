import { NavLink } from 'react-router-dom'

const menuItems = [
  { path: '/', label: '🏠 首页', exact: true },
  { path: '/create', label: '➕ 创建 Skill' },
  { path: '/skills', label: '📦 我的 Skills' },
  { path: '/drafts', label: '📝 草稿箱' },
  { path: '/settings', label: '⚙️ 设置' },
]

export default function Sidebar() {
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
    </aside>
  )
}
