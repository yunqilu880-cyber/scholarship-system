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

  const runEvaluation = useCallback(() => {
    const activeScholarships = scholarships.filter(s => s.active)
    const allResults: EvaluationResult[] = []

    for (const scholarship of activeScholarships) {
      const c = scholarship.conditions
      const eligibleStudents = students.filter(stu => {
        const reasons: string[] = []
        if (stu.gpa < c.minGpa) reasons.push(`GPA(${stu.gpa})不满足最低要求(${c.minGpa})`)
        if (stu.failedCourses > c.maxFailedCourses) reasons.push(`挂科${stu.failedCourses}门，超过上限(${c.maxFailedCourses})`)
        if (stu.volunteerHours < c.minVolunteerHours) reasons.push(`志愿时长(${stu.volunteerHours}h)不足(${c.minVolunteerHours}h)`)
        if (stu.totalScore < c.minTotalScore) reasons.push(`综合得分(${stu.totalScore})不满足要求(${c.minTotalScore})`)
        if (stu.sportsScore < c.minSportsScore) reasons.push(`体测(${stu.sportsScore})不达标(${c.minSportsScore})`)
        if (stu.hasPunishment) reasons.push('存在违纪处分记录')
        return reasons.length === 0
      }).sort((a, b) => b.totalScore - a.totalScore)

      const topStudents = eligibleStudents.slice(0, scholarship.quota * 2)

      topStudents.forEach((stu, idx) => {
        const rejectionReasons: string[] = []
        if (stu.gpa < c.minGpa) rejectionReasons.push(`GPA ${stu.gpa} < ${c.minGpa}`)
        if (stu.failedCourses > c.maxFailedCourses) rejectionReasons.push(`挂科${stu.failedCourses}门`)
        if (stu.volunteerHours < c.minVolunteerHours) rejectionReasons.push(`志愿时长不足`)
        if (stu.totalScore < c.minTotalScore) rejectionReasons.push(`综合得分不足`)
        if (stu.sportsScore < c.minSportsScore) rejectionReasons.push(`体测不达标`)
        if (stu.hasPunishment) rejectionReasons.push('违纪处分')

        const conflicts: string[] = []
        for (const rule of exclusions) {
          if (rule.academicYear !== scholarship.academicYear) continue
          if (rule.scholarshipA === scholarship.id || rule.scholarshipB === scholarship.id) {
            const otherId = rule.scholarshipA === scholarship.id ? rule.scholarshipB : rule.scholarshipA
            const otherScholarship = scholarships.find(s => s.id === otherId)
            const alreadyWon = allResults.some(r => r.scholarshipId === otherId && r.studentId === stu.id && r.eligible)
            if (alreadyWon && otherScholarship) {
              conflicts.push(`与${otherScholarship.name}互斥`)
            }
          }
        }

        const eligible = rejectionReasons.length === 0 && conflicts.length === 0

        allResults.push({
          studentId: stu.id,
          studentName: stu.name,
          department: stu.department,
          scholarshipId: scholarship.id,
          scholarshipName: scholarship.name,
          gpa: stu.gpa,
          totalScore: stu.totalScore,
          rank: eligible ? idx + 1 : -1,
          eligible,
          rejectionReasons,
          exclusionConflicts: conflicts,
          details: {
            academicScore: stu.gpa * 25,
            moralScore: stu.moralScore,
            practiceScore: stu.practiceScore,
            sportsScore: stu.sportsScore,
            extraScore: stu.extraScore,
          },
        })
      })
    }

    setResults(allResults)
  }, [students, scholarships, exclusions])

  return (
    <AppContext.Provider value={{
      students, scholarships, exclusions, results,
      setStudents, addStudent, updateStudent, deleteStudent,
      setScholarships, addScholarship, updateScholarship, deleteScholarship,
      setExclusions, addExclusion, deleteExclusion,
      runEvaluation, setResults,
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
