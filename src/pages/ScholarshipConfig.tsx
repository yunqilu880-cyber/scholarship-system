import { useState } from 'react'
import { useStore } from '../store'
import type { Scholarship } from '../types'
import { Plus, Trash2, X, Award, AlertCircle, Settings } from 'lucide-react'

const levels = ['国家级', '校级', '院级'] as const

export default function ScholarshipConfig() {
  const { scholarships, addScholarship, updateScholarship, deleteScholarship, exclusions, addExclusion, deleteExclusion } = useStore()
  const [tab, setTab] = useState<'scholarships' | 'exclusions'>('scholarships')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Scholarship | null>(null)
  const [form, setForm] = useState<Scholarship>({
    id: '', name: '', level: '校级', amount: 0, quota: 1, academicYear: '2025-2026',
    conditions: { minGpa: 3.0, maxFailedCourses: 0, minVolunteerHours: 40, minTotalScore: 80, minSportsScore: 70 },
    active: true,
  })
  const [newExclusion, setNewExclusion] = useState({ scholarshipA: '', scholarshipB: '' })

  const openAdd = () => {
    setEditing(null)
    setForm({
      id: Date.now().toString(), name: '', level: '校级', amount: 0, quota: 1, academicYear: '2025-2026',
      conditions: { minGpa: 3.0, maxFailedCourses: 0, minVolunteerHours: 40, minTotalScore: 80, minSportsScore: 70 },
      active: true,
    })
    setShowModal(true)
  }

  const openEdit = (s: Scholarship) => {
    setEditing(s)
    setForm(JSON.parse(JSON.stringify(s)))
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editing) {
      updateScholarship(form)
    } else {
      addScholarship(form)
    }
    setShowModal(false)
  }

  const handleAddExclusion = () => {
    if (!newExclusion.scholarshipA || !newExclusion.scholarshipB || newExclusion.scholarshipA === newExclusion.scholarshipB) return
    addExclusion({
      id: Date.now().toString(),
      scholarshipA: newExclusion.scholarshipA,
      scholarshipB: newExclusion.scholarshipB,
      type: 'mutual',
      academicYear: '2025-2026',
    })
    setNewExclusion({ scholarshipA: '', scholarshipB: '' })
  }

  const getScholarshipName = (id: string) => scholarships.find(s => s.id === id)?.name || '未知奖项'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">奖项与规则配置</h1>
          <p className="text-gray-500 text-sm">配置奖学金项目、评选条件与互斥规则</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {[
          { key: 'scholarships', label: '奖项配置', icon: Award },
          { key: 'exclusions', label: '互斥规则', icon: AlertCircle },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scholarships' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />添加奖项
            </button>
          </div>

          <div className="space-y-4">
            {scholarships.map(s => (
              <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{s.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.level === '国家级' ? 'bg-red-100 text-red-700' :
                          s.level === '校级' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>{s.level}</span>
                        {s.active
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">启用</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">停用</span>
                        }
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {s.academicYear} · 名额 {s.quota} 人 · 金额 &yen;{s.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">编辑</button>
                    <button onClick={() => deleteScholarship(s.id)} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">删除</button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: '最低GPA', value: `≥ ${s.conditions.minGpa}` },
                    { label: '挂科上限', value: `≤ ${s.conditions.maxFailedCourses} 门` },
                    { label: '志愿时长', value: `≥ ${s.conditions.minVolunteerHours}h` },
                    { label: '综合得分', value: `≥ ${s.conditions.minTotalScore}` },
                    { label: '体测要求', value: `≥ ${s.conditions.minSportsScore}` },
                  ].map(c => (
                    <div key={c.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-gray-500">{c.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{c.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'exclusions' && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              添加互斥规则
            </h3>
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">奖项A</label>
                <select
                  value={newExclusion.scholarshipA}
                  onChange={e => setNewExclusion({ ...newExclusion, scholarshipA: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择奖项...</option>
                  {scholarships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <span className="pb-2 text-gray-400">与</span>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">奖项B</label>
                <select
                  value={newExclusion.scholarshipB}
                  onChange={e => setNewExclusion({ ...newExclusion, scholarshipB: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择奖项...</option>
                  {scholarships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={handleAddExclusion} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
                <Plus className="w-4 h-4 inline mr-1" />添加互斥
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">奖项A</th>
                  <th className="px-4 py-3 font-medium">关系</th>
                  <th className="px-4 py-3 font-medium">奖项B</th>
                  <th className="px-4 py-3 font-medium">学年</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {exclusions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无互斥规则</td>
                  </tr>
                ) : (
                  exclusions.map(e => (
                    <tr key={e.id} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{getScholarshipName(e.scholarshipA)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">互斥</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{getScholarshipName(e.scholarshipB)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{e.academicYear}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => deleteExclusion(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Scholarship Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? '编辑奖项' : '添加奖项'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">奖项名称</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">级别</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">金额 (元)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">名额</label>
                  <input type="number" value={form.quota} onChange={e => setForm({ ...form, quota: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 pt-2 border-t">申请条件</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '最低GPA', key: 'minGpa' },
                  { label: '挂科上限', key: 'maxFailedCourses' },
                  { label: '最少志愿时长(h)', key: 'minVolunteerHours' },
                  { label: '最低综合得分', key: 'minTotalScore' },
                  { label: '最低体测分', key: 'minSportsScore' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input type="number" step="0.1"
                      value={(form.conditions as any)[f.key]}
                      onChange={e => setForm({ ...form, conditions: { ...form.conditions, [f.key]: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
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
