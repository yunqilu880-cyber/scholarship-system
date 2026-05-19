import { useState } from 'react'
import { useStore } from '../store'
import type { Scholarship, ScholarshipConditions } from '../types'
import { Plus, X, Award } from 'lucide-react'

const levels = ['综合一等奖', '综合二等奖', '综合三等奖', '学习优秀奖', '综合能力突出奖'] as const

const emptyConditions: ScholarshipConditions = {
  minProfessionalScore: 0, maxBasicRankPercent: 100,
  maxComprehensiveRankPercent: 100, maxProfessionalRankPercent: 100,
  minForeignScore: 0, minSportsScore: 0,
}

const majors = ['电子信息工程', '通信工程', '人工智能']

const emptyScholarship: Scholarship = {
  id: '', name: '', level: '综合一等奖', amount: 0, quota: 1,
  majorQuotas: Object.fromEntries(majors.map(m => [m, 0])),
  academicYear: '2025-2026', conditions: { ...emptyConditions }, active: true,
}

const conditionLabels: { key: keyof ScholarshipConditions; label: string; unit: string }[] = [
  { key: 'minProfessionalScore', label: '加权平均分（专业素质）', unit: '分' },
  { key: 'maxBasicRankPercent', label: '基本测评专业排名', unit: '%' },
  { key: 'maxComprehensiveRankPercent', label: '综合能力专业排名', unit: '%' },
  { key: 'maxProfessionalRankPercent', label: '专业素质专业排名', unit: '%' },
  { key: 'minForeignScore', label: '外语成绩', unit: '分' },
  { key: 'minSportsScore', label: '体育成绩', unit: '分' },
]

function formatCondition(key: string, value: number): string {
  const isMax = key.startsWith('max')
  if (isMax && value >= 100) return '不限'
  return `${isMax ? '前 ' : '≥ '}${value}${['minProfessionalScore', 'minForeignScore', 'minSportsScore'].includes(key) ? ' 分' : '%'}`
}

export default function ScholarshipConfig() {
  const { scholarships, addScholarship, updateScholarship, deleteScholarship } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Scholarship | null>(null)
  const [form, setForm] = useState<Scholarship>(emptyScholarship)

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyScholarship, id: Date.now().toString(), conditions: { ...emptyConditions } })
    setShowModal(true)
  }

  const openEdit = (s: Scholarship) => {
    setEditing(s)
    setForm({ ...s, conditions: { ...s.conditions } })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editing) { updateScholarship(form) } else { addScholarship(form) }
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">奖项与规则配置</h1>
          <p className="text-gray-500 text-sm">配置奖学金项目及其评选筛选条件</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />添加奖项
        </button>
      </div>

      <div className="space-y-4">
        {scholarships.map(s => (
          <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{s.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.level === '综合一等奖' ? 'bg-red-100 text-red-700' :
                      s.level === '综合二等奖' || s.level === '综合三等奖' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{s.level}</span>
                    {s.active
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">启用</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">停用</span>
                    }
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {s.academicYear} · 金额 &yen;{s.amount.toLocaleString()}
                    {' · '}
                    {majors.map(m => `${m}${s.majorQuotas[m] || 0}人`).join(' / ')}
                    {' · 共'}{Object.values(s.majorQuotas).reduce((a, b) => a + b, 0)}人
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">编辑</button>
                <button onClick={() => deleteScholarship(s.id)} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
              {conditionLabels.map(c => (
                <div key={c.key} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCondition(c.key, s.conditions[c.key])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {scholarships.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无奖项配置</p>
          <p className="text-gray-400 text-sm mt-1">点击"添加奖项"开始配置</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? '编辑奖项' : '添加奖项'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">奖项名称</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">级别</label>
                <select value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">金额 (元)</label>
                <input type="number" value={form.amount}
                  onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">名额（总计）</label>
                <input type="number" value={form.quota}
                  onChange={e => setForm({ ...form, quota: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 border-t pt-3 mb-3">各专业名额分配</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {majors.map(m => (
                <div key={m}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{m}</label>
                  <input type="number" value={form.majorQuotas[m] || 0}
                    onChange={e => setForm({
                      ...form,
                      majorQuotas: { ...form.majorQuotas, [m]: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>

            <p className="text-sm font-medium text-gray-700 border-t pt-3 mb-3">筛选条件</p>
            <div className="space-y-3">
              {conditionLabels.map(c => (
                <div key={c.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{c.label}（{c.unit}）</label>
                  <input type="number" step="0.1" value={form.conditions[c.key]}
                    onChange={e => setForm({
                      ...form,
                      conditions: { ...form.conditions, [c.key]: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
