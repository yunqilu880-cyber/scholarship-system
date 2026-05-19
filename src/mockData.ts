import type { Student, Scholarship, ExclusionRule } from "./types"

export const mockStudents: Student[] = []

export const mockScholarships: Scholarship[] = [
  {
    id: 's1', name: '综合一等奖学金', level: '综合一等奖', amount: 2500, quota: 8,
    majorQuotas: { '电子信息工程': 3, '通信工程': 3, '人工智能': 2 },
    academicYear: '2025-2026',
    conditions: { minProfessionalScore: 75, maxBasicRankPercent: 15, maxComprehensiveRankPercent: 30, maxProfessionalRankPercent: 100, minForeignScore: 80, minSportsScore: 80 },
    active: true,
  },
  {
    id: 's2', name: '综合二等奖学金', level: '综合二等奖', amount: 1500, quota: 15,
    majorQuotas: { '电子信息工程': 5, '通信工程': 5, '人工智能': 5 },
    academicYear: '2025-2026',
    conditions: { minProfessionalScore: 75, maxBasicRankPercent: 30, maxComprehensiveRankPercent: 100, maxProfessionalRankPercent: 100, minForeignScore: 75, minSportsScore: 80 },
    active: true,
  },
  {
    id: 's3', name: '综合三等奖学金', level: '综合三等奖', amount: 800, quota: 25,
    majorQuotas: { '电子信息工程': 9, '通信工程': 8, '人工智能': 8 },
    academicYear: '2025-2026',
    conditions: { minProfessionalScore: 75, maxBasicRankPercent: 30, maxComprehensiveRankPercent: 100, maxProfessionalRankPercent: 100, minForeignScore: 75, minSportsScore: 80 },
    active: true,
  },
  {
    id: 's4', name: '学习优秀奖', level: '学习优秀奖', amount: 500, quota: 10,
    majorQuotas: { '电子信息工程': 4, '通信工程': 3, '人工智能': 3 },
    academicYear: '2025-2026',
    conditions: { minProfessionalScore: 75, maxBasicRankPercent: 100, maxComprehensiveRankPercent: 100, maxProfessionalRankPercent: 20, minForeignScore: 0, minSportsScore: 0 },
    active: true,
  },
  {
    id: 's5', name: '综合能力突出奖', level: '综合能力突出奖', amount: 500, quota: 10,
    majorQuotas: { '电子信息工程': 4, '通信工程': 3, '人工智能': 3 },
    academicYear: '2025-2026',
    conditions: { minProfessionalScore: 0, maxBasicRankPercent: 100, maxComprehensiveRankPercent: 20, maxProfessionalRankPercent: 100, minForeignScore: 0, minSportsScore: 0 },
    active: true,
  },
]

export const mockExclusions: ExclusionRule[] = [
  { id: 'e1', scholarshipA: 's1', scholarshipB: 's2', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e2', scholarshipA: 's1', scholarshipB: 's3', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e3', scholarshipA: 's2', scholarshipB: 's3', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e4', scholarshipA: 's1', scholarshipB: 's4', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e5', scholarshipA: 's2', scholarshipB: 's4', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e6', scholarshipA: 's3', scholarshipB: 's4', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e7', scholarshipA: 's1', scholarshipB: 's5', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e8', scholarshipA: 's2', scholarshipB: 's5', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e9', scholarshipA: 's3', scholarshipB: 's5', type: 'mutual', academicYear: '2025-2026' },
]

export const departments = ["信息与电子工程学院"]
export const grades = ["2025"]
