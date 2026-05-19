import { useState, useRef } from 'react'
import { useStore } from '../store'
import type { Student } from '../types'
import { parseRank, formatRank } from '../types'
import { Plus, Upload, Search, Edit2, Trash2, X, FileSpreadsheet, Square, CheckSquare, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

const emptyStudent: Student = {
  id: '', name: '', studentId: '', grade: '', college: '信息与电子工程学院', major: '', className: '',
  peerReviewScore: 0, recordScore: 0, moralScore: 0,
  moralMajorRank: { rank: 0, total: 0 }, moralClassRank: { rank: 0, total: 0 },
  professionalScore: 0,
  professionalMajorRank: { rank: 0, total: 0 }, professionalClassRank: { rank: 0, total: 0 },
  basicTotal: 0, basicMajorRank: { rank: 0, total: 0 }, basicClassRank: { rank: 0, total: 0 },
  comprehensiveBaseScore: 0,
  comprehensiveBaseMajorRank: { rank: 0, total: 0 }, comprehensiveBaseClassRank: { rank: 0, total: 0 },
  researchInnovation: 0, researchMajorRank: { rank: 0, total: 0 }, researchClassRank: { rank: 0, total: 0 },
  professionalSkill: 0, skillMajorRank: { rank: 0, total: 0 }, skillClassRank: { rank: 0, total: 0 },
  organizationWork: 0, orgMajorRank: { rank: 0, total: 0 }, orgClassRank: { rank: 0, total: 0 },
  sportsAesthetics: 0, sportsAesMajorRank: { rank: 0, total: 0 }, sportsAesClassRank: { rank: 0, total: 0 },
  laborEducation: 0, laborMajorRank: { rank: 0, total: 0 }, laborClassRank: { rank: 0, total: 0 },
  comprehensiveTotal: 0, comprehensiveMajorRank: { rank: 0, total: 0 }, comprehensiveClassRank: { rank: 0, total: 0 },
  sportsScore: 0, sportsMajorRank: { rank: 0, total: 0 }, sportsClassRank: { rank: 0, total: 0 },
  foreignScore: 0, foreignMajorRank: { rank: 0, total: 0 }, foreignClassRank: { rank: 0, total: 0 },
}

function parseStudentIdName(s: string): { studentId: string; name: string } {
  const m = String(s).match(/^(\d+)\((.+)\)$/)
  return m ? { studentId: m[1], name: m[2] } : { studentId: '', name: String(s) }
}

export default function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent, setStudents } = useStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<Student>(emptyStudent)
  const [showImport, setShowImport] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [majorFilter, setMajorFilter] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const majors = ['电子信息工程', '通信工程', '人工智能']

  const filtered = students.filter(s => {
    if (search && !s.name.includes(search) && !s.studentId.includes(search)) return false
    if (majorFilter && s.major !== majorFilter) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyStudent, id: Date.now().toString() })
    setShowModal(true)
  }

  const openEdit = (s: Student) => { setEditing(s); setForm({ ...s }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name || !form.studentId) return
    if (editing) { updateStudent(form) } else { addStudent(form) }
    setShowModal(false)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    const ext = (file.name.split('.').pop() || '').toLowerCase()

    const parseRows = (rows: string[][]) => {
      const newStudents: Student[] = []
      for (let i = 3; i < rows.length; i++) {
        const r = rows[i]
        if (!r || !r[0]) continue
        const info = parseStudentIdName(String(r[0]))
        const s: Student = {
          id: info.studentId || Date.now().toString() + i,
          name: info.name, studentId: info.studentId,
          grade: String(r[1] || ''), college: String(r[2] || ''), major: String(r[3] || ''), className: String(r[4] || ''),
          peerReviewScore: parseFloat(r[5]) || 0, recordScore: parseFloat(r[6]) || 0,
          moralScore: parseFloat(r[7]) || 0,
          moralMajorRank: parseRank(String(r[8])), moralClassRank: parseRank(String(r[9])),
          professionalScore: parseFloat(r[10]) || 0,
          professionalMajorRank: parseRank(String(r[11])), professionalClassRank: parseRank(String(r[12])),
          basicTotal: parseFloat(r[13]) || 0,
          basicMajorRank: parseRank(String(r[14])), basicClassRank: parseRank(String(r[15])),
          comprehensiveBaseScore: parseFloat(r[16]) || 0,
          comprehensiveBaseMajorRank: parseRank(String(r[17])), comprehensiveBaseClassRank: parseRank(String(r[18])),
          researchInnovation: parseFloat(r[19]) || 0,
          researchMajorRank: parseRank(String(r[20])), researchClassRank: parseRank(String(r[21])),
          professionalSkill: parseFloat(r[22]) || 0,
          skillMajorRank: parseRank(String(r[23])), skillClassRank: parseRank(String(r[24])),
          organizationWork: parseFloat(r[25]) || 0,
          orgMajorRank: parseRank(String(r[26])), orgClassRank: parseRank(String(r[27])),
          sportsAesthetics: parseFloat(r[28]) || 0,
          sportsAesMajorRank: parseRank(String(r[29])), sportsAesClassRank: parseRank(String(r[30])),
          laborEducation: parseFloat(r[31]) || 0,
          laborMajorRank: parseRank(String(r[32])), laborClassRank: parseRank(String(r[33])),
          comprehensiveTotal: parseFloat(r[34]) || 0,
          comprehensiveMajorRank: parseRank(String(r[35])), comprehensiveClassRank: parseRank(String(r[36])),
          sportsScore: parseFloat(r[37]) || 0,
          sportsMajorRank: parseRank(String(r[38])), sportsClassRank: parseRank(String(r[39])),
          foreignScore: parseFloat(r[40]) || 0,
          foreignMajorRank: parseRank(String(r[41])), foreignClassRank: parseRank(String(r[42])),
        }
        newStudents.push(s)
      }
      setStudents(newStudents)
    }

    if (ext === 'csv') {
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        const rows = text.split('\n').filter(l => l.trim()).map(l => l.split(','))
        parseRows(rows)
      }
      reader.readAsText(file)
    } else {
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
        parseRows(rows)
      }
      reader.readAsArrayBuffer(file)
    }
    setShowImport(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) { setSelectedIds(new Set()) }
    else { setSelectedIds(new Set(filtered.map(s => s.id))) }
  }

  const batchDelete = () => { selectedIds.forEach(id => deleteStudent(id)); setSelectedIds(new Set()) }

  const exportSelected = () => {
    const sel = students.filter(s => selectedIds.has(s.id))
    const h = ['姓名','学号','年级','学院','专业','班级','评议成绩','记实成绩','品德素质得分','品德专业排名','品德班级排名','专业素质得分','专业素质专业排名','专业素质班级排名','基本测评总分','基本测评专业排名','基本测评班级排名','综合基础分','综合基础专业排名','综合基础班级排名','研究创新分','研究创新专业排名','研究创新班级排名','专业技能分','技能专业排名','技能班级排名','组织工作分','组织工作专业排名','组织工作班级排名','体育美育分','体育美育专业排名','体育美育班级排名','劳动教育分','劳动教育专业排名','劳动教育班级排名','综合能力总分','综合能力专业排名','综合能力班级排名','体育成绩','体育专业排名','体育班级排名','外语成绩','外语专业排名','外语班级排名']
    const rows = sel.map(s => [s.name,s.studentId,s.grade,s.college,s.major,s.className,s.peerReviewScore,s.recordScore,s.moralScore,formatRank(s.moralMajorRank),formatRank(s.moralClassRank),s.professionalScore,formatRank(s.professionalMajorRank),formatRank(s.professionalClassRank),s.basicTotal,formatRank(s.basicMajorRank),formatRank(s.basicClassRank),s.comprehensiveBaseScore,formatRank(s.comprehensiveBaseMajorRank),formatRank(s.comprehensiveBaseClassRank),s.researchInnovation,formatRank(s.researchMajorRank),formatRank(s.researchClassRank),s.professionalSkill,formatRank(s.skillMajorRank),formatRank(s.skillClassRank),s.organizationWork,formatRank(s.orgMajorRank),formatRank(s.orgClassRank),s.sportsAesthetics,formatRank(s.sportsAesMajorRank),formatRank(s.sportsAesClassRank),s.laborEducation,formatRank(s.laborMajorRank),formatRank(s.laborClassRank),s.comprehensiveTotal,formatRank(s.comprehensiveMajorRank),formatRank(s.comprehensiveClassRank),s.sportsScore,formatRank(s.sportsMajorRank),formatRank(s.sportsClassRank),s.foreignScore,formatRank(s.foreignMajorRank),formatRank(s.foreignClassRank)])
    const ws = XLSX.utils.aoa_to_sheet([h, ...rows])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, '学生数据')
    XLSX.writeFile(wb, '学生数据导出.xlsx')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">学生数据管理</h1>
          <p className="text-gray-500 text-sm">信息与电子工程学院 · 综合测评数据 · 共 {students.length} 人</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入测评表
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
              <h2 className="text-lg font-bold">导入综合测评表</h2>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              <p className="font-medium mb-1">直接上传学校综合测评 Excel 文件</p>
              <p className="text-xs">支持 .xlsx / .xls 格式，系统自动跳过前3行表头，从第4行开始读取学生数据</p>
            </div>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">点击上传 Excel 文件</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      {/* Search & batch bar */}
      <div className="flex flex-wrap gap-2 lg:gap-3 mb-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="搜索姓名或学号..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={majorFilter} onChange={e => setMajorFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部专业</option>
          {majors.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto">共 {filtered.length} 人</span>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800 font-medium">已选 {selectedIds.size} 人</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filtered.length ? '取消全选' : '全选'}
          </button>
          <span className="flex-1" />
          <button onClick={exportSelected} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50">
            <Download className="w-3 h-3" />导出选中
          </button>
          <button onClick={batchDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600">
            <Trash2 className="w-3 h-3" />批量删除
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-3 py-2.5 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium">姓名</th>
                <th className="px-3 py-2.5 font-medium">学号</th>
                <th className="px-3 py-2.5 font-medium">班级</th>
                <th className="px-3 py-2.5 font-medium text-center">品德素质</th>
                <th className="px-3 py-2.5 font-medium text-center">专业素质</th>
                <th className="px-3 py-2.5 font-medium text-center">基本测评总分</th>
                <th className="px-3 py-2.5 font-medium text-center">基本项排名</th>
                <th className="px-3 py-2.5 font-medium text-center">综合能力总分</th>
                <th className="px-3 py-2.5 font-medium text-center">综合能力排名</th>
                <th className="px-3 py-2.5 font-medium text-center">体育</th>
                <th className="px-3 py-2.5 font-medium text-center">外语</th>
                <th className="px-3 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    <button onClick={() => toggleSelect(s.id)} className="text-gray-400 hover:text-blue-600">
                      {selectedIds.has(s.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{s.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{s.studentId}</td>
                  <td className="px-3 py-2.5 text-gray-600">{s.className}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-gray-700">{s.moralScore.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-gray-700">{s.professionalScore.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-blue-600">{s.basicTotal.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={s.basicMajorRank.rank <= s.basicMajorRank.total * 0.15 ? 'text-green-600 font-semibold' : s.basicMajorRank.rank <= s.basicMajorRank.total * 0.3 ? 'text-amber-600 font-semibold' : 'text-gray-600'}>
                      {formatRank(s.basicMajorRank)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-blue-600">{s.comprehensiveTotal.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={s.comprehensiveMajorRank.rank <= s.comprehensiveMajorRank.total * 0.3 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                      {formatRank(s.comprehensiveMajorRank)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={s.sportsScore >= 80 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{s.sportsScore.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={s.foreignScore >= 75 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{s.foreignScore.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-2.5">
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

      {/* Add/Edit Modal — simplified version */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? '编辑学生' : '添加学生'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: '姓名', key: 'name' }, { label: '学号', key: 'studentId' },
                { label: '年级', key: 'grade' }, { label: '学院', key: 'college' },
                { label: '专业', key: 'major' }, { label: '班级', key: 'className' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type="text" value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              {[
                { label: '评议成绩', key: 'peerReviewScore' }, { label: '记实成绩', key: 'recordScore' },
                { label: '专业素质', key: 'professionalScore' }, { label: '综合基础分', key: 'comprehensiveBaseScore' },
                { label: '研究创新', key: 'researchInnovation' }, { label: '专业技能', key: 'professionalSkill' },
                { label: '组织工作', key: 'organizationWork' }, { label: '体育美育', key: 'sportsAesthetics' },
                { label: '劳动教育', key: 'laborEducation' }, { label: '体育成绩', key: 'sportsScore' },
                { label: '外语成绩', key: 'foreignScore' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type="number" step="0.01" value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
