import { useState, useRef } from 'react'
import { useStore } from '../store'
import type { Student } from '../types'
import { departments } from '../mockData'
import { Plus, Upload, Search, Edit2, Trash2, X, FileSpreadsheet, Square, CheckSquare, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

const emptyStudent: Student = {
  id: '', name: '', studentId: '', department: '', major: '', grade: '',
  gpa: 0, moralScore: 0, practiceScore: 0, sportsScore: 0, extraScore: 0, totalScore: 0,
  failedCourses: 0, hasPunishment: false, volunteerHours: 0, awards: [], materials: [],
}

export default function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent } = useStore()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<Student>(emptyStudent)
  const [showImport, setShowImport] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = students.filter(s => {
    if (search && !s.name.includes(search) && !s.studentId.includes(search)) return false
    if (deptFilter && s.department !== deptFilter) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyStudent, id: Date.now().toString() })
    setShowModal(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({ ...s })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.studentId) return
    const total = form.gpa * 25 + form.moralScore * 0.25 + form.practiceScore * 0.25 + form.sportsScore * 0.25 + form.extraScore
    const updated = { ...form, totalScore: Math.round(total * 10) / 10 }
    if (editing) {
      updateStudent(updated)
    } else {
      addStudent(updated)
    }
    setShowModal(false)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    const ext = file.name.split('.').pop()?.toLowerCase()

    const parseRows = (rows: string[][]) => {
      for (let i = 1; i < rows.length; i++) {
        const vals = rows[i]
        if (vals.length < 5) continue
        const stu: Student = {
          ...emptyStudent,
          id: Date.now().toString() + i,
          name: vals[0]?.trim() || '',
          studentId: vals[1]?.trim() || '',
          department: vals[2]?.trim() || '',
          major: vals[3]?.trim() || '',
          grade: vals[4]?.trim() || '',
          gpa: parseFloat(vals[5]) || 0,
          moralScore: parseFloat(vals[6]) || 0,
          practiceScore: parseFloat(vals[7]) || 0,
          sportsScore: parseFloat(vals[8]) || 0,
          extraScore: parseFloat(vals[9]) || 0,
          totalScore: parseFloat(vals[10]) || 0,
          failedCourses: parseInt(vals[11]) || 0,
          volunteerHours: parseInt(vals[12]) || 0,
        }
        addStudent(stu)
      }
    }

    if (ext === 'csv') {
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        const rows = text.split('\n').filter(l => l.trim()).map(l => l.split(','))
        if (rows.length < 2) return
        parseRows(rows)
      }
      reader.readAsText(file)
    } else {
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
        if (rows.length < 2) return
        parseRows(rows)
      }
      reader.readAsArrayBuffer(file)
    }

    setShowImport(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)))
    }
  }

  const batchDelete = () => {
    selectedIds.forEach(id => deleteStudent(id))
    setSelectedIds(new Set())
  }

  const exportSelected = () => {
    const selected = students.filter(s => selectedIds.has(s.id))
    const header = ['姓名', '学号', '学院', '专业', '年级', 'GPA', '德育分', '实践分', '体测分', '加分', '总评', '挂科数', '志愿时长']
    const rows = selected.map(s => [
      s.name, s.studentId, s.department, s.major, s.grade,
      s.gpa, s.moralScore, s.practiceScore, s.sportsScore, s.extraScore,
      s.totalScore, s.failedCourses, s.volunteerHours,
    ])
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '导出数据')
    XLSX.writeFile(wb, '学生数据导出.xlsx')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">学生数据管理</h1>
          <p className="text-gray-500 text-sm">管理学生基本信息、成绩与综合测评数据</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            批量导入
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加学生
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">批量导入学生数据</h2>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              <p className="font-medium mb-1">支持 CSV / Excel 文件</p>
              <p className="text-xs">表头顺序：姓名,学号,学院,专业,年级,GPA,德育分,实践分,体测分,加分,总评,挂科数,志愿时长</p>
            </div>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">点击上传 CSV 或 Excel 文件</p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名或学号..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部学院</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto">
          共 {filtered.length} 人
        </span>
      </div>

      {/* Batch actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800 font-medium">已选 {selectedIds.size} 人</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filtered.length ? '取消全选' : '全选'}
          </button>
          <span className="flex-1" />
          <button
            onClick={exportSelected}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
          >
            <Download className="w-3 h-3" />
            导出选中
          </button>
          <button
            onClick={batchDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
            批量删除
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">学号</th>
                <th className="px-4 py-3 font-medium">学院</th>
                <th className="px-4 py-3 font-medium">专业</th>
                <th className="px-4 py-3 font-medium">年级</th>
                <th className="px-4 py-3 font-medium text-center">GPA</th>
                <th className="px-4 py-3 font-medium text-center">综合得分</th>
                <th className="px-4 py-3 font-medium text-center">挂科</th>
                <th className="px-4 py-3 font-medium text-center">志愿时长</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleSelect(s.id)} className="text-gray-400 hover:text-blue-600">
                      {selectedIds.has(s.id)
                        ? <CheckSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{s.studentId}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.department}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.major}</td>
                  <td className="px-4 py-2.5 text-gray-500">{s.grade}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`font-semibold ${getScoreColor(s.gpa * 25)}`}>{s.gpa.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="font-semibold text-blue-600">{s.totalScore.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {s.failedCourses > 0
                      ? <span className="text-red-600 font-medium">{s.failedCourses}</span>
                      : <span className="text-green-600">0</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{s.volunteerHours}h</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteStudent(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? '编辑学生' : '添加学生'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '姓名', key: 'name' },
                { label: '学号', key: 'studentId' },
                { label: '学院', key: 'department' },
                { label: '专业', key: 'major' },
                { label: '年级', key: 'grade' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              {[
                { label: 'GPA', key: 'gpa' },
                { label: '德育分', key: 'moralScore' },
                { label: '实践分', key: 'practiceScore' },
                { label: '体测分', key: 'sportsScore' },
                { label: '加分', key: 'extraScore' },
                { label: '挂科数', key: 'failedCourses' },
                { label: '志愿时长(h)', key: 'volunteerHours' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="number"
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
