export interface Student {
  id: string
  name: string
  studentId: string
  department: string
  major: string
  grade: string
  gpa: number
  moralScore: number
  practiceScore: number
  sportsScore: number
  extraScore: number
  totalScore: number
  failedCourses: number
  hasPunishment: boolean
  volunteerHours: number
  awards: string[]
  materials: string[]
}

export interface Scholarship {
  id: string
  name: string
  level: '国家级' | '校级' | '院级'
  amount: number
  quota: number
  academicYear: string
  conditions: {
    minGpa: number
    maxFailedCourses: number
    minVolunteerHours: number
    minTotalScore: number
    minSportsScore: number
  }
  active: boolean
}

export interface ExclusionRule {
  id: string
  scholarshipA: string
  scholarshipB: string
  type: 'mutual'
  academicYear: string
}

export interface EvaluationResult {
  studentId: string
  studentName: string
  department: string
  scholarshipId: string
  scholarshipName: string
  gpa: number
  totalScore: number
  rank: number
  eligible: boolean
  rejectionReasons: string[]
  exclusionConflicts: string[]
  details: {
    academicScore: number
    moralScore: number
    practiceScore: number
    sportsScore: number
    extraScore: number
  }
}
