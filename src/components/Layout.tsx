import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Award, FileBarChart, GraduationCap, Menu } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台', end: true },
  { to: '/students', icon: Users, label: '学生数据管理' },
  { to: '/scholarships', icon: Award, label: '奖项与规则配置' },
  { to: '/evaluation', icon: FileBarChart, label: '评选结果' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <>
      <div className="h-14 flex items-center gap-2 px-5 border-b border-gray-100 shrink-0">
        <GraduationCap className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-base text-gray-800">奖学金评选系统</span>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
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
      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 shrink-0">
        v1.0 · Hackathon Demo
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white flex flex-col shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-sm text-gray-800">奖学金评选系统</span>
        </div>

        <div className="p-3 lg:p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
