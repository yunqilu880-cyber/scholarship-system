import { useStore } from '../store'
import { Users, Award, CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react'

export default function Dashboard() {
  const { students, scholarships, results, exclusions } = useStore()

  const activeScholarships = scholarships.filter(s => s.active).length
  const eligibleCount = results.filter(r => r.eligible).length
  const totalQuota = scholarships.filter(s => s.active).reduce((sum, s) => sum + s.quota, 0)
  const avgGpa = (students.reduce((s, stu) => s + stu.gpa, 0) / students.length).toFixed(2)

  const stats = [
    { label: '学生总数', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '活跃奖项', value: activeScholarships, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '评选名额', value: totalQuota, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '互斥规则', value: exclusions.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: '平均绩点', value: avgGpa, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '符合资格', value: eligibleCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const recentStudents = students.slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">工作台</h1>
      <p className="text-gray-500 text-sm mb-6">奖学金评选系统 · 2025-2026学年</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-lg`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            学生概览
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">姓名</th>
                <th className="pb-2 font-medium">学院</th>
                <th className="pb-2 font-medium">GPA</th>
                <th className="pb-2 font-medium">综合得分</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map(s => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800">{s.name}</td>
                  <td className="py-2 text-gray-500">{s.department}</td>
                  <td className="py-2">
                    <span className={s.gpa >= 3.8 ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                      {s.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 font-medium text-gray-700">{s.totalScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            活跃奖项
          </h2>
          <div className="space-y-3">
            {scholarships.filter(s => s.active).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.level} · 名额 {s.quota}人 · GPA &ge; {s.conditions.minGpa}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-600">&yen;{s.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
