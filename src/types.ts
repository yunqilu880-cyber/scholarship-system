export interface Rank {
  rank: number
  total: number
}

export function formatRank(r: Rank): string {
  return `${r.rank}/${r.total}`
}

export function parseRank(s: string): Rank {
  const parts = s.split('/')
  return { rank: parseInt(parts[0]) || 0, total: parseInt(parts[1]) || 0 }
}

export interface Student {
  id: string
  name: string
  studentId: string
  grade: string
  college: string
  major: string
  className: string

  // 基本测评分数
  peerReviewScore: number
  recordScore: number
  moralScore: number
  moralMajorRank: Rank
  moralClassRank: Rank
  professionalScore: number
  professionalMajorRank: Rank
  professionalClassRank: Rank
  basicTotal: number
  basicMajorRank: Rank
  basicClassRank: Rank

  // 综合能力
  comprehensiveBaseScore: number
  comprehensiveBaseMajorRank: Rank
  comprehensiveBaseClassRank: Rank
  researchInnovation: number
  researchMajorRank: Rank
  researchClassRank: Rank
  professionalSkill: number
  skillMajorRank: Rank
  skillClassRank: Rank
  organizationWork: number
  orgMajorRank: Rank
  orgClassRank: Rank
  sportsAesthetics: number
  sportsAesMajorRank: Rank
  sportsAesClassRank: Rank
  laborEducation: number
  laborMajorRank: Rank
  laborClassRank: Rank
  comprehensiveTotal: number
  comprehensiveMajorRank: Rank
  comprehensiveClassRank: Rank

  // 体育
  sportsScore: number
  sportsMajorRank: Rank
  sportsClassRank: Rank

  // 外语
  foreignScore: number
  foreignMajorRank: Rank
  foreignClassRank: Rank
}

export interface ScholarshipConditions {
  minProfessionalScore: number
  maxBasicRankPercent: number
  maxComprehensiveRankPercent: number
  maxProfessionalRankPercent: number
  minForeignScore: number
  minSportsScore: number
}

export interface Scholarship {
  id: string
  name: string
  level: '综合一等奖' | '综合二等奖' | '综合三等奖' | '学习优秀奖' | '综合能力突出奖'
  amount: number
  quota: number
  majorQuotas: Record<string, number>
  academicYear: string
  conditions: ScholarshipConditions
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
  className: string
  major: string
  scholarshipId: string
  scholarshipName: string
  basicTotal: number
  basicMajorRank: Rank
  basicPercent: number
  comprehensiveTotal: number
  comprehensiveMajorRank: Rank
  comprehensivePercent: number
  eligible: boolean
  rejectionReasons: string[]
  exclusionConflicts: string[]
}
