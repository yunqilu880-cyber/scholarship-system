import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Award, FileBarChart, GraduationCap } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台', end: true },
  { to: '/students', icon: Users, label: '学生数据管理' },
  { to: '/scholarships', icon: Award, label: '奖项与规则配置' },
  { to: '/evaluation', icon: FileBarChart, label: '评选结果' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-gray-100">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-base text-gray-800">奖学金评选系统</span>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          v1.0 · Hackathon Demo
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
