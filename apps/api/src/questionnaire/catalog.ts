export interface Choice {
  id: string
  label: string
}

/** Interest follow-ups stay empty until screenshot copy arrives. No invented options. */
export interface BranchPlaceholder {
  hobby: string
  pending: true
  note: '分支内容待补'
}

/**
 * Friday minimal flow, Chinese rewrite of the legacy Ditto step order:
 * basics → preference / one interest branch → this week's availability.
 * Ethnicity, politics, face verification, and iMessage are not included.
 */
export const QUESTIONNAIRE = {
  steps: [
    { id: 'displayName', kind: 'text', title: '怎么称呼你？', placeholder: '例如林夏' },
    {
      id: 'gender',
      kind: 'single',
      title: '你的性别？',
      options: [
        { id: 'female', label: '女' },
        { id: 'male', label: '男' },
        { id: 'unspecified', label: '不想说' },
      ] satisfies Choice[],
    },
    {
      id: 'lookingFor',
      kind: 'single',
      title: '想认识谁？',
      options: [
        { id: 'women', label: '女生' },
        { id: 'men', label: '男生' },
        { id: 'any', label: '都可以' },
      ] satisfies Choice[],
    },
    {
      id: 'grade',
      kind: 'single',
      title: '你现在几年级？',
      options: [
        { id: '1', label: '大一' },
        { id: '2', label: '大二' },
        { id: '3', label: '大三' },
        { id: '4', label: '大四' },
      ] satisfies Choice[],
    },
    {
      id: 'intent',
      kind: 'single',
      title: '你在找什么？',
      options: [
        { id: 'life_partner', label: '长期伴侣' },
        { id: 'serious', label: '认真关系' },
        { id: 'casual', label: '轻松约会' },
        { id: 'friends', label: '新朋友' },
        { id: 'unsure', label: '还不确定' },
      ] satisfies Choice[],
    },
    {
      id: 'interests',
      kind: 'multi',
      title: '平时喜欢什么？',
      caption: '最多 5 个。',
      max: 5,
      options: [
        { id: 'cooking', label: '做饭' },
        { id: 'music', label: '音乐' },
        { id: 'travel', label: '旅行' },
        { id: 'reading', label: '读书' },
        { id: 'gym', label: '运动' },
        { id: 'gaming', label: '游戏' },
        { id: 'movies', label: '影视' },
        { id: 'art', label: '艺术' },
      ] satisfies Choice[],
    },
    {
      id: 'availability',
      kind: 'multi',
      title: '这周什么时候可以见面？',
      caption: '上海时间。至少选一段。',
      max: 3,
      options: [
        { id: 'sat_afternoon', label: '周六下午 14:00–17:00' },
        { id: 'sun_afternoon', label: '周日下午 14:00–17:00' },
        { id: 'wed_evening', label: '周三晚上 19:00–21:00' },
      ] satisfies Choice[],
    },
  ],
  branches: {
    cooking: { hobby: 'cooking', pending: true, note: '分支内容待补' },
    music: { hobby: 'music', pending: true, note: '分支内容待补' },
    gym: { hobby: 'gym', pending: true, note: '分支内容待补' },
  } satisfies Record<string, BranchPlaceholder>,
}

export const SLOT_PRESETS: Record<string, { weekday: number; startMin: number; endMin: number; note: string }> = {
  sat_afternoon: { weekday: 6, startMin: 14 * 60, endMin: 17 * 60, note: '周六下午' },
  sun_afternoon: { weekday: 7, startMin: 14 * 60, endMin: 17 * 60, note: '周日下午' },
  wed_evening: { weekday: 3, startMin: 19 * 60, endMin: 21 * 60, note: '周三晚上' },
}

const BRANCH_HOBBIES = ['cooking', 'music', 'gym'] as const

export const INTEREST_IDS = QUESTIONNAIRE.steps.find((step) => step.id === 'interests')
  ? (QUESTIONNAIRE.branches ? ['cooking', 'music', 'travel', 'reading', 'gym', 'gaming', 'movies', 'art'] : [])
  : []

export function firstBranchedHobby(interests: string[]): (typeof BRANCH_HOBBIES)[number] | null {
  const found = interests.find((item) => (BRANCH_HOBBIES as readonly string[]).includes(item))
  return (found as (typeof BRANCH_HOBBIES)[number] | undefined) ?? null
}
