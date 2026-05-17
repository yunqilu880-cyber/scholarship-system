import { useState } from 'react'
import { useStore } from '../store'
import { Play, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function EvaluationResults() {
  const { results, runEvaluation, scholarships } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterScholarship, setFilterScholarship] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = results.filter(r => {
    if (filterScholarship && r.scholarshipId !== filterScholarship) return false
    if (filterDept && r.department !== filterDept) return false
    if (filterStatus === 'eligible' && !r.eligible) return false
    if (filterStatus === 'rejected' && r.eligible) return false
    if (filterStatus === 'conflict' && r.exclusionConflicts.length === 0) return false
    return true
  })

  const departments = [...new Set(results.map(r => r.department))]
  const eligibleCount = results.filter(r => r.eligible).length
  const rejectedCount = results.filter(r => !r.eligible).length
  const conflictCount = results.filter(r => r.exclusionConflicts.length > 0).length

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getResultKey = (r: typeof results[0]) => `${r.studentId}-${r.scholarshipId}`

  const exportResults = () => {
    const header = ['姓名', '学院', '奖项', 'GPA', '综合得分', '学业成绩', '德育分', '实践分', '体测分', '加分项', '排名', '状态', '不合格原因', '互斥冲突']
    const rows = filtered.map(r => [
      r.studentName, r.department, r.scholarshipName,
      r.gpa, r.totalScore,
      r.details.academicScore, r.details.moralScore, r.details.practiceScore, r.details.sportsScore, r.details.extraScore,
      r.eligible && r.rank > 0 ? r.rank : '-',
      r.eligible ? '符合' : r.exclusionConflicts.length > 0 ? '互斥冲突' : '不符合',
      r.rejectionReasons.join('；'),
      r.exclusionConflicts.join('；'),
    ])
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '评选结果')
    XLSX.writeFile(wb, '评选结果导出.xlsx')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">评选结果</h1>
          <p className="text-gray-500 text-sm">自动评选引擎输出 · 可追溯得分明细</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            {results.length > 0 && (
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出Excel
              </button>
            )}
            <button
              onClick={runEvaluation}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              运行评选引擎
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">尚未运行评选</p>
          <p className="text-gray-400 text-sm">点击"运行评选引擎"开始自动评估</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '总评估数', value: results.length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '符合资格', value: eligibleCount, color: 'text-green-600', bg: 'bg-green-50' },
              { label: '不符合', value: rejectedCount, color: 'text-red-600', bg: 'bg-red-50' },
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

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select
              value={filterScholarship}
              onChange={e => setFilterScholarship(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部奖项</option>
              {scholarships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部学院</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="eligible">符合资格</option>
              <option value="rejected">不符合</option>
              <option value="conflict">互斥冲突</option>
            </select>
            <span className="text-sm text-gray-500 self-center ml-auto">
              共 {filtered.length} 条结果
            </span>
          </div>

          {/* Results List */}
          <div className="space-y-2">
            {filtered.map((r) => {
              const key = getResultKey(r)
              const isExpanded = expandedId === key
              return (
                <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(key)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {r.eligible
                        ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        : r.exclusionConflicts.length > 0
                        ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      }
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{r.studentName}</span>
                          <span className="text-xs text-gray-400">{r.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{r.scholarshipName}</span>
                          <span>·</span>
                          <span>GPA {r.gpa.toFixed(2)}</span>
                          <span>·</span>
                          <span>综合 {r.totalScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.eligible && r.rank > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          第{r.rank}名
                        </span>
                      )}
                      {!r.eligible && r.rejectionReasons.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                          {r.rejectionReasons.length}项不满足
                        </span>
                      )}
                      {r.exclusionConflicts.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          互斥
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      {/* Score Breakdown */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">得分明细</p>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { label: '学业成绩', value: r.details.academicScore, max: 100 },
                            { label: '德育分', value: r.details.moralScore, max: 100 },
                            { label: '实践分', value: r.details.practiceScore, max: 100 },
                            { label: '体测分', value: r.details.sportsScore, max: 100 },
                            { label: '加分项', value: r.details.extraScore, max: 20 },
                          ].map(d => (
                            <div key={d.label} className="text-center">
                              <div className="relative w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div
                                  className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min((d.value / d.max) * 100, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500">{d.label}</p>
                              <p className="text-sm font-semibold text-gray-800">{d.value.toFixed(1)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rejection Reasons */}
                      {r.rejectionReasons.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-red-600 mb-1">不满足条件</p>
                          <div className="flex flex-wrap gap-1">
                            {r.rejectionReasons.map((reason, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exclusion Conflicts */}
                      {r.exclusionConflicts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-amber-600 mb-1">互斥冲突</p>
                          <div className="flex flex-wrap gap-1">
                            {r.exclusionConflicts.map((c, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.eligible && r.rejectionReasons.length === 0 && r.exclusionConflicts.length === 0 && (
                        <p className="text-sm text-green-600 font-medium">全部条件满足，建议授予此奖项</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
