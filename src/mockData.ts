import type { Student, Scholarship, ExclusionRule } from './types'

export const mockStudents: Student[] = [
  { id: '1', name: '张三', studentId: '2021001', department: '信电学院', major: '软件工程', grade: '2021级', gpa: 3.92, moralScore: 95, practiceScore: 88, sportsScore: 82, extraScore: 15, totalScore: 94.2, failedCourses: 0, hasPunishment: false, volunteerHours: 120, awards: [], materials: ['获奖证书1.pdf', '志愿证明.pdf'] },
  { id: '2', name: '李四', studentId: '2021002', department: '信电学院', major: '计算机科学与技术', grade: '2021级', gpa: 3.75, moralScore: 90, practiceScore: 92, sportsScore: 85, extraScore: 10, totalScore: 90.5, failedCourses: 0, hasPunishment: false, volunteerHours: 80, awards: [], materials: [] },
  { id: '3', name: '王五', studentId: '2021003', department: '萨塞克斯人工智能学院', major: '应用数学', grade: '2021级', gpa: 3.88, moralScore: 92, practiceScore: 75, sportsScore: 90, extraScore: 8, totalScore: 89.8, failedCourses: 1, hasPunishment: false, volunteerHours: 60, awards: [], materials: ['论文发表.pdf'] },
  { id: '4', name: '赵六', studentId: '2021004', department: '信电学院', major: '软件工程', grade: '2021级', gpa: 3.45, moralScore: 85, practiceScore: 90, sportsScore: 78, extraScore: 12, totalScore: 85.2, failedCourses: 0, hasPunishment: true, volunteerHours: 100, awards: [], materials: [] },
  { id: '5', name: '钱七', studentId: '2022001', department: '萨塞克斯人工智能学院', major: '人工智能', grade: '2022级', gpa: 3.96, moralScore: 98, practiceScore: 95, sportsScore: 88, extraScore: 20, totalScore: 96.1, failedCourses: 0, hasPunishment: false, volunteerHours: 150, awards: ['ACM金牌'], materials: ['ACM证书.pdf'] },
  { id: '6', name: '孙八', studentId: '2022002', department: '萨塞克斯人工智能学院', major: '统计学', grade: '2022级', gpa: 3.61, moralScore: 88, practiceScore: 82, sportsScore: 75, extraScore: 5, totalScore: 83.4, failedCourses: 0, hasPunishment: false, volunteerHours: 45, awards: [], materials: [] },
  { id: '7', name: '周九', studentId: '2021005', department: '信电学院', major: '网络工程', grade: '2021级', gpa: 3.82, moralScore: 91, practiceScore: 86, sportsScore: 80, extraScore: 9, totalScore: 88.7, failedCourses: 0, hasPunishment: false, volunteerHours: 70, awards: [], materials: [] },
  { id: '8', name: '吴十', studentId: '2023001', department: '信电学院', major: '电子信息工程', grade: '2023级', gpa: 3.51, moralScore: 87, practiceScore: 78, sportsScore: 92, extraScore: 6, totalScore: 82.1, failedCourses: 0, hasPunishment: false, volunteerHours: 55, awards: [], materials: [] },
]

export const mockScholarships: Scholarship[] = [
  { id: 's1', name: '国家奖学金', level: '国家级', amount: 8000, quota: 2, academicYear: '2025-2026', conditions: { minGpa: 3.8, maxFailedCourses: 0, minVolunteerHours: 80, minTotalScore: 90, minSportsScore: 80 }, active: true },
  { id: 's2', name: '校一等奖学金', level: '校级', amount: 3000, quota: 3, academicYear: '2025-2026', conditions: { minGpa: 3.5, maxFailedCourses: 0, minVolunteerHours: 60, minTotalScore: 85, minSportsScore: 75 }, active: true },
  { id: 's3', name: '校二等奖学金', level: '校级', amount: 1500, quota: 5, academicYear: '2025-2026', conditions: { minGpa: 3.2, maxFailedCourses: 1, minVolunteerHours: 40, minTotalScore: 80, minSportsScore: 70 }, active: true },
  { id: 's4', name: '单项奖学金', level: '院级', amount: 800, quota: 4, academicYear: '2025-2026', conditions: { minGpa: 3.0, maxFailedCourses: 2, minVolunteerHours: 30, minTotalScore: 75, minSportsScore: 60 }, active: true },
  { id: 's5', name: '科技创新奖学金', level: '校级', amount: 2000, quota: 2, academicYear: '2025-2026', conditions: { minGpa: 3.3, maxFailedCourses: 0, minVolunteerHours: 40, minTotalScore: 82, minSportsScore: 70 }, active: true },
]

export const mockExclusions: ExclusionRule[] = [
  { id: 'e1', scholarshipA: 's1', scholarshipB: 's2', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e2', scholarshipA: 's1', scholarshipB: 's3', type: 'mutual', academicYear: '2025-2026' },
  { id: 'e3', scholarshipA: 's2', scholarshipB: 's3', type: 'mutual', academicYear: '2025-2026' },
]

export const departments = ['信电学院', '萨塞克斯人工智能学院']
export const grades = ['2021级', '2022级', '2023级', '2024级']
