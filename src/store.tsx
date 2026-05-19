import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Student, Scholarship, ExclusionRule, EvaluationResult } from './types'
import { mockStudents, mockScholarships, mockExclusions } from './mockData'

interface AppState {
  students: Student[]
  scholarships: Scholarship[]
  exclusions: ExclusionRule[]
  results: EvaluationResult[]
  setStudents: (s: Student[]) => void
  addStudent: (s: Student) => void
  updateStudent: (s: Student) => void
  deleteStudent: (id: string) => void
  setScholarships: (s: Scholarship[]) => void
  addScholarship: (s: Scholarship) => void
  updateScholarship: (s: Scholarship) => void
  deleteScholarship: (id: string) => void
  setExclusions: (e: ExclusionRule[]) => void
  addExclusion: (e: ExclusionRule) => void
  deleteExclusion: (id: string) => void
  runEvaluation: () => void
  setResults: (r: EvaluationResult[]) => void
  resetAll: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [scholarships, setScholarships] = useState<Scholarship[]>(mockScholarships)
  const [exclusions, setExclusions] = useState<ExclusionRule[]>(mockExclusions)
  const [results, setResults] = useState<EvaluationResult[]>([])

  const addStudent = useCallback((s: Student) => setStudents(prev => [...prev, s]), [])
  const updateStudent = useCallback((s: Student) => setStudents(prev => prev.map(x => x.id === s.id ? s : x)), [])
  const deleteStudent = useCallback((id: string) => setStudents(prev => prev.filter(x => x.id !== id)), [])

  const addScholarship = useCallback((s: Scholarship) => setScholarships(prev => [...prev, s]), [])
  const updateScholarship = useCallback((s: Scholarship) => setScholarships(prev => prev.map(x => x.id === s.id ? s : x)), [])
  const deleteScholarship = useCallback((id: string) => setScholarships(prev => prev.filter(x => x.id !== id)), [])

  const addExclusion = useCallback((e: ExclusionRule) => setExclusions(prev => [...prev, e]), [])
  const deleteExclusion = useCallback((id: string) => setExclusions(prev => prev.filter(x => x.id !== id)), [])

  const resetAll = useCallback(() => {
    setStudents([])
    setScholarships([])
    setExclusions([])
    setResults([])
  }, [])

  const runEvaluation = useCallback(() => {
    const activeScholarships = scholarships.filter(s => s.active)
    const allResults: EvaluationResult[] = []

    // Group students by major and compute per-major ranking percentages
    const majorGroups = new Map<string, Student[]>()
    for (const stu of students) {
      const key = stu.major || '未分类'
      if (!majorGroups.has(key)) majorGroups.set(key, [])
      majorGroups.get(key)!.push(stu)
    }

    const majorPercentMap = new Map<string, { basicPercent: number; comprehensivePercent: number; professionalPercent: number }>()
    for (const [, group] of majorGroups) {
      const total = group.length

      const byBasic = [...group].sort((a, b) => b.basicTotal - a.basicTotal)
      for (let i = 0; i < byBasic.length; i++) {
        const entry = majorPercentMap.get(byBasic[i].id) || { basicPercent: 0, comprehensivePercent: 0, professionalPercent: 0 }
        entry.basicPercent = ((i + 1) / total) * 100
        majorPercentMap.set(byBasic[i].id, entry)
      }

      const byComp = [...group].sort((a, b) => b.comprehensiveTotal - a.comprehensiveTotal)
      for (let i = 0; i < byComp.length; i++) {
        const entry = majorPercentMap.get(byComp[i].id)!
        entry.comprehensivePercent = ((i + 1) / total) * 100
      }

      const byProfessional = [...group].sort((a, b) => b.professionalScore - a.professionalScore)
      for (let i = 0; i < byProfessional.length; i++) {
        const entry = majorPercentMap.get(byProfessional[i].id)!
        entry.professionalPercent = ((i + 1) / total) * 100
      }
    }

    for (const scholarship of activeScholarships) {
      const c = scholarship.conditions

      const evaluated = students.map(stu => {
        const p = majorPercentMap.get(stu.id) || { basicPercent: 100, comprehensivePercent: 100, professionalPercent: 100 }
        const basicPercent = p.basicPercent
        const comprehensivePercent = p.comprehensivePercent
        const professionalPercent = p.professionalPercent
        const reasons: string[] = []

        if (c.minProfessionalScore > 0 && stu.professionalScore < c.minProfessionalScore) {
          reasons.push(`加权平均分${stu.professionalScore} < ${c.minProfessionalScore}`)
        }
        if (c.maxBasicRankPercent < 100 && basicPercent > c.maxBasicRankPercent) {
          reasons.push(`基本项排名${basicPercent.toFixed(1)}% > ${c.maxBasicRankPercent}%`)
        }
        if (c.maxComprehensiveRankPercent < 100 && comprehensivePercent > c.maxComprehensiveRankPercent) {
          reasons.push(`综合能力排名${comprehensivePercent.toFixed(1)}% > ${c.maxComprehensiveRankPercent}%`)
        }
        if (c.maxProfessionalRankPercent < 100 && professionalPercent > c.maxProfessionalRankPercent) {
          reasons.push(`专业素质排名${professionalPercent.toFixed(1)}% > ${c.maxProfessionalRankPercent}%`)
        }
        if (c.minForeignScore > 0 && stu.foreignScore < c.minForeignScore) {
          reasons.push(`外语成绩${stu.foreignScore} < ${c.minForeignScore}`)
        }
        if (c.minSportsScore > 0 && stu.sportsScore < c.minSportsScore) {
          reasons.push(`体育成绩${stu.sportsScore} < ${c.minSportsScore}`)
        }
        return { stu, basicPercent, comprehensivePercent, eligible: reasons.length === 0, reasons }
      })

      // Non-qualifying students go straight to results
      for (const item of evaluated.filter(e => !e.eligible)) {
        allResults.push({
          studentId: item.stu.id, studentName: item.stu.name, className: item.stu.className, major: item.stu.major,
          scholarshipId: scholarship.id, scholarshipName: scholarship.name,
          basicTotal: item.stu.basicTotal, basicMajorRank: item.stu.basicMajorRank, basicPercent: item.basicPercent,
          comprehensiveTotal: item.stu.comprehensiveTotal, comprehensiveMajorRank: item.stu.comprehensiveMajorRank, comprehensivePercent: item.comprehensivePercent,
          eligible: false,
          rejectionReasons: item.reasons,
          exclusionConflicts: [],
        })
      }

      // Group qualifying students by major, sort within each group, award per-major
      const passing = evaluated.filter(e => e.eligible)
      const groups = new Map<string, typeof passing>()
      for (const item of passing) {
        const m = item.stu.major
        if (!groups.has(m)) groups.set(m, [])
        groups.get(m)!.push(item)
      }

      for (const [major, group] of groups) {
        const quota = scholarship.majorQuotas[major] || Object.values(scholarship.majorQuotas).reduce((a, b) => a + b, 0)

        group.sort((a, b) => {
          if (scholarship.level === '学习优秀奖') return b.stu.professionalScore - a.stu.professionalScore
          return b.stu.comprehensiveTotal - a.stu.comprehensiveTotal
        })

        let awarded = 0
        for (let i = 0; i < group.length; i++) {
          const item = group[i]
          const stu = item.stu
          const quotaReached = awarded >= quota

          const conflicts: string[] = []
          if (!quotaReached) {
            for (const rule of exclusions) {
              if (rule.academicYear !== scholarship.academicYear) continue
              if (rule.scholarshipA === scholarship.id || rule.scholarshipB === scholarship.id) {
                const otherId = rule.scholarshipA === scholarship.id ? rule.scholarshipB : rule.scholarshipA
                const otherScholarship = activeScholarships.find(s => s.id === otherId)
                const alreadyWon = allResults.some(r => r.scholarshipId === otherId && r.studentId === stu.id && r.eligible)
                if (alreadyWon && otherScholarship) {
                  conflicts.push(`与${otherScholarship.name}互斥`)
                }
              }
            }
          }

          const ok = !quotaReached && conflicts.length === 0
          if (ok) awarded++

          const reasonList: string[] = []
          if (quotaReached) reasonList.push('名额已满')
          else if (conflicts.length > 0) reasonList.push(...conflicts)
          else reasonList.push(...item.reasons)

          allResults.push({
            studentId: stu.id, studentName: stu.name, className: stu.className, major: stu.major,
            scholarshipId: scholarship.id, scholarshipName: scholarship.name,
            basicTotal: stu.basicTotal, basicMajorRank: stu.basicMajorRank, basicPercent: item.basicPercent,
            comprehensiveTotal: stu.comprehensiveTotal, comprehensiveMajorRank: stu.comprehensiveMajorRank, comprehensivePercent: item.comprehensivePercent,
            eligible: ok,
            rejectionReasons: reasonList,
            exclusionConflicts: conflicts,
          })
        }
      }
    }

    setResults(allResults)
  }, [students, scholarships, exclusions])

  return (
    <AppContext.Provider value={{
      students, scholarships, exclusions, results,
      setStudents, addStudent, updateStudent, deleteStudent,
      setScholarships, addScholarship, updateScholarship, deleteScholarship,
      setExclusions, addExclusion, deleteExclusion,
      runEvaluation, setResults, resetAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useStore must be inside AppProvider')
  return ctx
}
