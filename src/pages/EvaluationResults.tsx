import { useState } from 'react'
import { useStore } from '../store'
import { formatRank } from '../types'
import { Play, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function EvaluationResults() {
  const { results, runEvaluation, scholarships, students } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterScholarship, setFilterScholarship] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState<'scholarship' | 'student'>('scholarship')

  const meetsConditions = (r: typeof results[0]) =>
    r.eligible || (r.rejectionReasons.length === 1 && r.rejectionReasons[0] === '名额已满')

  // Compute per-scholarship per-major quota gap summary
  const quotaGapSummary = (() => {
    const majors = [...new Set(results.map(r => r.major).filter(Boolean))]
    return scholarships.filter(s => s.active).map(sch => {
      const majorRows = majors.map(m => {
        const bySch = results.filter(r => r.scholarshipId === sch.id && r.major === m)
        const quota = sch.majorQuotas[m] || Object.values(sch.majorQuotas).reduce((a, b) => a + b, 0)
        const qualified = bySch.filter(r => meetsConditions(r)).length
        const awarded = bySch.filter(r => r.eligible).length
        const gap = quota - qualified
        return { major: m, quota, qualified, awarded, gap }
      })
      return { sch, majorRows }
    })
  })()

  const filtered = results.filter(r => {
    if (filterScholarship && r.scholarshipId !== filterScholarship) return false
    if (filterStatus === 'eligible' && !r.eligible) return false
    if (filterStatus === 'rejected' && (r.eligible || r.exclusionConflicts.length > 0 || meetsConditions(r))) return false
    if (filterStatus === 'qualified' && !meetsConditions(r)) return false
    if (filterStatus === 'conflict' && r.exclusionConflicts.length === 0) return false
    return true
  })

  const eligibleCount = results.filter(r => r.eligible).length
  const qualifiedCount = results.filter(r => meetsConditions(r)).length
  const rejectedCount = results.filter(r => !r.eligible && r.exclusionConflicts.length === 0 && !meetsConditions(r)).length
  const conflictCount = results.filter(r => r.exclusionConflicts.length > 0).length

  const getResultKey = (r: typeof results[0]) => `${r.studentId}-${r.scholarshipId}`

  const exportResults = () => {
    const header = ['姓名', '班级', '奖项', '加权平均分', '基本测评总分', '基本项排名', '基本项排名%', '综合能力总分', '综合能力排名', '综合能力排名%', '状态', '不合格原因']
    const rows = filtered.map(r => [
      r.studentName, r.className, r.scholarshipName,
      '-',
      r.basicTotal, formatRank(r.basicMajorRank), r.basicPercent.toFixed(1) + '%',
      r.comprehensiveTotal, formatRank(r.comprehensiveMajorRank), r.comprehensivePercent.toFixed(1) + '%',
      r.eligible ? '获得' : r.exclusionConflicts.length > 0 ? '互斥冲突' : '不符合',
      r.rejectionReasons.join('；'),
    ])
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, '评选结果')
    XLSX.writeFile(wb, '评选结果导出.xlsx')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">评选结果</h1>
          <p className="text-gray-500 text-sm">根据奖项筛选条件自动评选</p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('scholarship')}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'scholarship' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >按奖项</button>
                <button
                  onClick={() => setViewMode('student')}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'student' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >按学生</button>
              </div>
              <button onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />导出Excel
              </button>
            </>
          )}
          <button onClick={runEvaluation}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Play className="w-4 h-4" />运行评选引擎
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">尚未运行评选</p>
          <p className="text-gray-400 text-sm">点击"运行评选引擎"根据奖项筛选条件自动评估</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
            {[
              { label: '总评估人次', value: results.length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '获得奖项', value: eligibleCount, color: 'text-green-600', bg: 'bg-green-50' },
              { label: '符合条件', value: qualifiedCount, color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: '不达标', value: rejectedCount, color: 'text-red-600', bg: 'bg-red-50' },
              { label: '互斥冲突', value: conflictCount, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className={`${s.bg} p-2 rounded-lg`}>
                    <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                  </div>
                  <span className="text-sm text-gray-500">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quota Gap Summary */}
          {quotaGapSummary.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-700 mb-3">名额分配概况</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">奖项</th>
                      <th className="pb-2 font-medium">专业</th>
                      <th className="pb-2 font-medium text-center">名额</th>
                      <th className="pb-2 font-medium text-center">符合</th>
                      <th className="pb-2 font-medium text-center">获奖</th>
                      <th className="pb-2 font-medium text-center">空缺</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotaGapSummary.map(({ sch, majorRows }) =>
                      majorRows.map((row, i) => (
                        <tr key={`${sch.id}-${row.major}`} className="border-b border-gray-50">
                          {i === 0 && (
                            <td className="py-2 pr-3 font-medium text-gray-800" rowSpan={majorRows.length}>{sch.name}</td>
                          )}
                          <td className="py-2 pr-3 text-gray-600">{row.major}</td>
                          <td className="py-2 text-center text-gray-700">{row.quota}</td>
                          <td className="py-2 text-center text-gray-700">{row.qualified}</td>
                          <td className="py-2 text-center text-gray-700">{row.awarded}</td>
                          <td className={`py-2 text-center font-semibold ${row.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {row.gap > 0 ? row.gap : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'scholarship' && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
                <select value={filterScholarship} onChange={e => setFilterScholarship(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">全部奖项</option>
                  {scholarships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">全部状态</option>
                  <option value="eligible">获得奖项</option>
                  <option value="qualified">符合条件</option>
                  <option value="rejected">不达标</option>
                  <option value="conflict">互斥冲突</option>
                </select>
                <span className="text-sm text-gray-500 self-center ml-auto">共 {filtered.length} 条</span>
              </div>

              {/* Results list */}
              <div className="space-y-2">
                {filtered.map(r => {
                  const key = getResultKey(r)
                  const isExpanded = expandedId === key
                  return (
                    <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : key)}>
                        <div className="flex items-center gap-3 flex-1">
                          {r.eligible ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            : r.exclusionConflicts.length > 0 ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{r.studentName}</span>
                              <span className="text-xs text-gray-400">{r.className}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span>{r.scholarshipName}</span>
                              <span>·</span>
                              <span>基本测评 {r.basicTotal.toFixed(2)}</span>
                              <span>·</span>
                              <span>排名 {formatRank(r.basicMajorRank)} ({r.basicPercent.toFixed(1)}%)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {r.eligible && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">获得</span>
                          )}
                          {!r.eligible && r.rejectionReasons.filter(x => x !== '名额已满').length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                              {r.rejectionReasons.filter(x => x !== '名额已满').length}项不满足
                            </span>
                          )}
                          {r.exclusionConflicts.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">互斥</span>
                          )}
                          {r.rejectionReasons.includes('名额已满') && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">名额已满</span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 text-sm">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">基本测评总分</p>
                              <p className="font-semibold text-gray-800">{r.basicTotal.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">基本项排名</p>
                              <p className="font-semibold text-gray-800">{formatRank(r.basicMajorRank)} ({r.basicPercent.toFixed(1)}%)</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">综合能力总分</p>
                              <p className="font-semibold text-gray-800">{r.comprehensiveTotal.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">综合能力排名</p>
                              <p className="font-semibold text-gray-800">{formatRank(r.comprehensiveMajorRank)} ({r.comprehensivePercent.toFixed(1)}%)</p>
                            </div>
                          </div>
                          {r.rejectionReasons.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-red-600 mb-1">拒绝原因</p>
                              <div className="flex flex-wrap gap-1">
                                {r.rejectionReasons.map((reason, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{reason}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {r.exclusionConflicts.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-amber-600 mb-1">互斥冲突</p>
                              <div className="flex flex-wrap gap-1">
                                {r.exclusionConflicts.map((c, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {r.eligible && (
                            <p className="text-sm text-green-600 font-medium">满足所有条件，已授予此奖项</p>
                          )}
                          {!r.eligible && meetsConditions(r) && (
                            <p className="text-sm text-amber-600 font-medium">满足评选条件，但名额已满未能授予</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {viewMode === 'student' && (
            <StudentResults results={results} students={students} />
          )}
        </>
      )}
    </div>
  )
}

function StudentResults({ results, students }: {
  results: ReturnType<typeof import('../store').useStore>['results']
  students: ReturnType<typeof import('../store').useStore>['students']
}) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  const meetsConditions = (r: typeof results[0]) =>
    r.eligible || (r.rejectionReasons.length === 1 && r.rejectionReasons[0] === '名额已满')

  // Group results by student
  const studentMap = new Map<string, typeof results>()
  for (const r of results) {
    if (!studentMap.has(r.studentId)) studentMap.set(r.studentId, [])
    studentMap.get(r.studentId)!.push(r)
  }

  const studentSummaries = students
    .filter(s => studentMap.has(s.id))
    .map(s => {
      const items = studentMap.get(s.id)!
      const won = items.filter(r => r.eligible).length
      const qualified = items.filter(r => meetsConditions(r)).length
      return { student: s, items, won, qualified }
    })

  return (
    <div className="space-y-3">
      {studentSummaries.map(({ student, items, won, qualified }) => {
        const isExpanded = expandedStudent === student.id
        return (
          <div key={student.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full ${won > 0 ? 'bg-green-500' : qualified > 0 ? 'bg-amber-500' : 'bg-red-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <span className="text-xs text-gray-400">{student.className}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{student.major}</span>
                    <span>·</span>
                    <span>基本测评 {student.basicTotal.toFixed(2)}</span>
                    <span>·</span>
                    <span>综合能力 {student.comprehensiveTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {won > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">获得 {won} 项</span>
                )}
                {qualified > won && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">符合 {qualified} 项</span>
                )}
                {qualified === 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">未获奖</span>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 bg-gray-50">
                      <th className="px-4 py-2 font-medium">奖项</th>
                      <th className="px-4 py-2 font-medium text-center">基本排名%</th>
                      <th className="px-4 py-2 font-medium text-center">综合排名%</th>
                      <th className="px-4 py-2 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(r => (
                      <tr key={r.scholarshipId} className="border-t border-gray-50">
                        <td className="px-4 py-2 text-gray-800">{r.scholarshipName}</td>
                        <td className="px-4 py-2 text-center text-gray-600">{r.basicPercent.toFixed(1)}%</td>
                        <td className="px-4 py-2 text-center text-gray-600">{r.comprehensivePercent.toFixed(1)}%</td>
                        <td className="px-4 py-2">
                          {r.eligible ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">获得</span>
                          ) : r.exclusionConflicts.length > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">互斥</span>
                          ) : meetsConditions(r) ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">名额已满</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">{r.rejectionReasons.filter(x => x !== '名额已满').length}项不满足</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
      {studentSummaries.length === 0 && (
        <div className="text-center py-12 text-gray-400">暂无评选结果</div>
      )}
    </div>
  )
}
