import { useState } from 'react'
import { useStore } from '../store'
import { Users, Award, FileText, AlertTriangle, Upload, Settings, Play, FileSpreadsheet, Check, Download } from 'lucide-react'
import { formatRank } from '../types'

const steps = [
  { icon: Upload, label: '导入测评表', desc: '上传综合测评 Excel' },
  { icon: Settings, label: '配置奖项', desc: '设定条件与名额' },
  { icon: Play, label: '运行评选', desc: '一键自动评估' },
  { icon: FileSpreadsheet, label: '导出结果', desc: '查看并下载报表' },
]

export default function Dashboard() {
  const { students, scholarships, results, resetAll } = useStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const stepStatus = [
    students.length > 0,
    scholarships.filter(s => s.active).length > 0,
    results.length > 0,
    results.filter(r => r.eligible).length > 0,
  ]

  const activeScholarships = scholarships.filter(s => s.active).length
  const avgBasic = students.length > 0
    ? (students.reduce((s, stu) => s + stu.basicTotal, 0) / students.length).toFixed(2)
    : '0'
  const avgComprehensive = students.length > 0
    ? (students.reduce((s, stu) => s + stu.comprehensiveTotal, 0) / students.length).toFixed(2)
    : '0'
  const sportsOk = students.filter(s => s.sportsScore >= 80).length
  const foreignOk = students.filter(s => s.foreignScore >= 75).length

  const stats = [
    { label: '学生总数', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '活跃奖项', value: activeScholarships, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '基本测评均分', value: avgBasic, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '综合能力均分', value: avgComprehensive, icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: '体测达标(≥80)', value: `${sportsOk}/${students.length}`, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '外语达标(≥75)', value: `${foreignOk}/${students.length}`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const topBasic = [...students].sort((a, b) => b.basicTotal - a.basicTotal).slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">工作台</h1>
      <p className="text-gray-500 text-sm mb-6">信息与电子工程学院 · 综合测评系统</p>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">快速上手</p>
        <a
          href={`${import.meta.env.BASE_URL}奖学金评选模板.xlsx`}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 mb-5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          下载奖学金评选模板
        </a>
        <div className="flex items-start justify-between">
          {steps.map((step, i) => {
            const done = stepStatus[i]
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-all ${
                    done ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <p className={`text-xs font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 sm:mx-2 mt-5.5 rounded ${
                    stepStatus[i] ? 'bg-blue-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">基本测评总分 TOP 5</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">姓名</th>
              <th className="pb-2 font-medium">班级</th>
              <th className="pb-2 font-medium">基本测评</th>
              <th className="pb-2 font-medium">专业排名</th>
              <th className="pb-2 font-medium">综合能力</th>
            </tr>
          </thead>
          <tbody>
            {topBasic.map(s => (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="py-2 text-gray-800">{s.name}</td>
                <td className="py-2 text-gray-500">{s.className}</td>
                <td className="py-2 font-semibold text-blue-600">{s.basicTotal.toFixed(2)}</td>
                <td className="py-2 text-gray-600">{formatRank(s.basicMajorRank)}</td>
                <td className="py-2 text-gray-600">{s.comprehensiveTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showResetConfirm ? (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          重置全部数据
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">确认重置全部数据？</p>
            <p className="text-xs text-red-600 mt-0.5">这将清空所有学生、奖项、互斥规则和评选结果，不可恢复。</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { resetAll(); setShowResetConfirm(false) }}
              className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">确认重置</button>
            <button onClick={() => setShowResetConfirm(false)}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
