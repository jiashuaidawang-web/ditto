export interface Choice {
  id: string
  label: string
  emoji?: string
}

export interface SpecialtyCard {
  hobby: string
  title: string
  options: Choice[]
}

/** English keys, Chinese labels. Options are only those in the frozen 06 table. */
export const HOBBIES: Choice[] = [
  { id: 'cooking', label: '做饭', emoji: '🍳' },
  { id: 'music', label: '音乐', emoji: '🎵' },
  { id: 'travel', label: '旅行', emoji: '✈️' },
  { id: 'reading', label: '阅读', emoji: '📚' },
  { id: 'gym', label: '健身', emoji: '🏋️' },
  { id: 'gaming', label: '游戏', emoji: '🎮' },
  { id: 'movies', label: '影视', emoji: '🎬' },
  { id: 'art', label: '艺术', emoji: '🎨' },
]

export const HOBBY_IDS = HOBBIES.map((hobby) => hobby.id)

const other: Choice = { id: 'other', label: '其他', emoji: '✎' }

export const SPECIALTIES: Record<string, SpecialtyCard> = {
  cooking: {
    hobby: 'cooking',
    title: '你做饭偏哪种风格？',
    options: [
      { id: 'italian', label: '意式', emoji: '🍝' },
      { id: 'asian', label: '亚洲菜', emoji: '🍜' },
      { id: 'mexican', label: '墨西哥菜', emoji: '🌮' },
      { id: 'comfort_food', label: '家常安慰菜', emoji: '🥧' },
      { id: 'baking', label: '烘焙', emoji: '🧁' },
      { id: 'grilling', label: '烧烤', emoji: '🔥' },
      { id: 'healthy_bowls', label: '轻食碗', emoji: '🥗' },
      { id: 'brunch', label: '早午餐', emoji: '🥐' },
      other,
    ],
  },
  music: {
    hobby: 'music',
    title: '你常听什么风格？',
    options: [
      { id: 'pop', label: '流行', emoji: '🎤' },
      { id: 'hip_hop', label: '嘻哈', emoji: '🎧' },
      { id: 'indie', label: '独立', emoji: '🎸' },
      { id: 'electronic', label: '电子', emoji: '🎛️' },
      { id: 'rnb', label: 'R&B', emoji: '💜' },
      { id: 'rock', label: '摇滚', emoji: '🤘' },
      { id: 'country', label: '乡村', emoji: '🤠' },
      { id: 'jazz', label: '爵士', emoji: '🎷' },
      { id: 'classical', label: '古典', emoji: '🎻' },
      { id: 'kpop', label: 'K-pop', emoji: '✨' },
      { id: 'latin', label: '拉丁', emoji: '💃' },
      other,
    ],
  },
  travel: {
    hobby: 'travel',
    title: '你旅行偏哪种打开方式？',
    options: [
      { id: 'backpacking', label: '背包穷游', emoji: '🎒' },
      { id: 'luxury', label: '轻奢慢旅行', emoji: '✨' },
      { id: 'foodie_tours', label: '美食打卡', emoji: '🍜' },
      { id: 'adventure', label: '户外探险', emoji: '🏔️' },
      { id: 'beach_sun', label: '海边晒太阳', emoji: '🏖️' },
      { id: 'city_hopping', label: '城市连逛', emoji: '🏙️' },
      { id: 'solo', label: '一个人走', emoji: '🚶' },
      { id: 'road_trips', label: '自驾公路', emoji: '🚗' },
      other,
    ],
  },
  reading: {
    hobby: 'reading',
    title: '最近在读哪类书？',
    options: [
      { id: 'lit_fic', label: '严肃文学 / 纯文学', emoji: '📖' },
      { id: 'fantasy', label: '奇幻', emoji: '🐉' },
      { id: 'scifi', label: '科幻', emoji: '🚀' },
      { id: 'mystery', label: '悬疑推理', emoji: '🔍' },
      { id: 'romance', label: '言情 / 浪漫', emoji: '💕' },
      { id: 'memoir', label: '回忆录', emoji: '🥚' },
      { id: 'self_help', label: '自我成长', emoji: '🧠' },
      { id: 'poetry', label: '诗歌', emoji: '🌹' },
      { id: 'classics', label: '经典名著', emoji: '📚' },
      { id: 'smut', label: '偏甜/偏肉口…也行吧', emoji: '🥴' },
      other,
    ],
  },
  gym: {
    hobby: 'gym',
    title: '你训练偏哪种？',
    options: [
      { id: 'lifting', label: '力量举铁', emoji: '🏋️' },
      { id: 'running', label: '跑步', emoji: '🏃' },
      { id: 'yoga', label: '瑜伽', emoji: '🧘' },
      { id: 'pilates', label: '普拉提', emoji: '🤸' },
      { id: 'crossfit', label: 'CrossFit', emoji: '💥' },
      { id: 'boxing', label: '拳击', emoji: '🥊' },
      { id: 'dance', label: '舞蹈', emoji: '💃' },
      { id: 'cycling', label: '骑行', emoji: '🚴' },
      { id: 'climbing', label: '攀岩', emoji: '🧗' },
      other,
    ],
  },
  gaming: {
    hobby: 'gaming',
    title: '你爱玩哪类游戏？',
    options: [
      { id: 'fps', label: 'FPS', emoji: '🔫' },
      { id: 'rpg', label: 'RPG', emoji: '🗡️' },
      { id: 'sports', label: '体育竞技', emoji: '⚽' },
      { id: 'moba', label: 'MOBA', emoji: '🛡️' },
      { id: 'strategy', label: '策略', emoji: '♟️' },
      { id: 'indie', label: '独立游戏', emoji: '👾' },
      { id: 'sims_cozy', label: '模拟 / 治愈', emoji: '🏡' },
      { id: 'fighting', label: '格斗', emoji: '🤼' },
      { id: 'mmo', label: 'MMO', emoji: '🌐' },
      other,
    ],
  },
  movies: {
    hobby: 'movies',
    title: '你爱看哪类片子？',
    options: [
      { id: 'indie', label: '独立影像', emoji: '🎞️' },
      { id: 'horror', label: '恐怖', emoji: '👻' },
      { id: 'romcom', label: '爱情喜剧', emoji: '💑' },
      { id: 'action', label: '动作', emoji: '💥' },
      { id: 'scifi', label: '科幻', emoji: '🚀' },
      { id: 'documentary', label: '纪录片', emoji: '🎥' },
      { id: 'a24', label: '文艺独立片那挂', emoji: '🎬' },
      { id: 'foreign', label: '外语片', emoji: '🌍' },
      { id: 'anime', label: '动漫', emoji: '🌸' },
      { id: 'reality', label: '真人秀', emoji: '📺' },
      other,
    ],
  },
  art: {
    hobby: 'art',
    title: '你常用哪些创作媒介？',
    options: [
      { id: 'drawing', label: '素描 / 手绘', emoji: '✏️' },
      { id: 'painting', label: '绘画', emoji: '🖼️' },
      { id: 'digital', label: '数字创作', emoji: '💻' },
      { id: 'pottery', label: '陶艺', emoji: '🏺' },
      { id: 'sculpture', label: '雕塑', emoji: '🗿' },
      { id: 'collage', label: '拼贴', emoji: '🧩' },
      { id: 'crafts', label: '手工', emoji: '✂️' },
      { id: 'mixed_media', label: '综合材料', emoji: '🎨' },
      other,
    ],
  },
}

export const QUESTIONNAIRE = {
  steps: [
    {
      id: 'student',
      kind: 'single',
      title: '你现在是学生吗？',
      privacy: '仅用于匹配，不会公开展示',
      options: [
        { id: 'yes', label: '是的，我是学生', emoji: '🎓' },
        { id: 'no', label: '不是学生', emoji: '💼' },
      ] satisfies Choice[],
    },
    { id: 'displayName', kind: 'text', title: '你好，我是不如见一面', placeholder: '你的名字', illustration: '🕊️' },
    {
      id: 'gender',
      kind: 'single',
      title: '你的性别是？',
      options: [
        { id: 'male', label: '男生' },
        { id: 'female', label: '女生' },
        { id: 'nonbinary', label: '非二元' },
      ] satisfies Choice[],
    },
    {
      id: 'lookingFor',
      kind: 'single',
      title: '你想认识谁？',
      privacy: '仅用于匹配，不会公开展示',
      options: [
        { id: 'men', label: '男生' },
        { id: 'women', label: '女生' },
        { id: 'nonbinary', label: '非二元' },
        { id: 'any', label: '都可以' },
      ] satisfies Choice[],
    },
    {
      id: 'birthday',
      kind: 'date',
      title: '你的生日是哪天？',
      privacy: '只会向对方展示年龄',
    },
    {
      id: 'grade',
      kind: 'single',
      title: '你现在几年级？',
      caption: '校园匹配仍用年级差。',
      options: [
        { id: '1', label: '大一' },
        { id: '2', label: '大二' },
        { id: '3', label: '大三' },
        { id: '4', label: '大四' },
      ] satisfies Choice[],
    },
    {
      id: 'interests',
      kind: 'interests',
      title: '你有哪些爱好和兴趣？',
      caption: '可多选；选结构化兴趣后会多问一小步',
      customLabel: '写一个爱好',
      options: HOBBIES,
    },
    {
      id: 'availability',
      kind: 'multi',
      title: '这周你什么时候方便见面？',
      caption: '可多选 · 公共场合优先安排',
      options: [
        { id: 'fri_pm', label: '周五下午', time: '14:00 – 18:00' },
        { id: 'fri_eve', label: '周五晚上', time: '18:30 – 21:00' },
        { id: 'sat_am', label: '周六上午', time: '10:00 – 12:00' },
        { id: 'sat_pm', label: '周六下午', time: '14:00 – 18:00' },
        { id: 'sat_eve', label: '周六晚上', time: '18:30 – 21:00' },
        { id: 'sun_am', label: '周日上午', time: '10:00 – 12:00' },
        { id: 'sun_pm', label: '周日下午', time: '14:00 – 18:00' },
        { id: 'sun_eve', label: '周日晚上', time: '18:30 – 21:00' },
      ] satisfies Array<Choice & { time: string }>,
    },
    {
      id: 'ethnicity',
      kind: 'multi',
      wide: true,
      title: '你的族裔背景是？',
      privacy: '仅用于匹配，不会公开展示',
      options: [
        { id: 'han', label: '汉族' },
        { id: 'other_asian', label: '其他亚洲裔' },
        { id: 'white', label: '白人 / 高加索' },
        { id: 'black', label: '非裔 / 黑人' },
        { id: 'latine', label: '拉丁裔 / 西语裔' },
        { id: 'mena', label: '中东 / 北非' },
        { id: 'mixed', label: '混血 / 多种族' },
        { id: 'other', label: '其他' },
        { id: 'skip', label: '不想说' },
      ] satisfies Choice[],
    },
    {
      id: 'ethnicityPrefs',
      kind: 'multi',
      wide: true,
      title: '对对方的族裔有偏好吗？',
      privacy: '仅用于匹配，不会公开展示',
      options: [
        { id: 'no_preference', label: '没有偏好' },
        { id: 'han', label: '汉族' },
        { id: 'other_asian', label: '其他亚洲裔' },
        { id: 'white', label: '白人 / 高加索' },
        { id: 'black', label: '非裔 / 黑人' },
        { id: 'latine', label: '拉丁裔 / 西语裔' },
        { id: 'mena', label: '中东 / 北非' },
        { id: 'mixed', label: '混血 / 多种族' },
        { id: 'other', label: '其他' },
        { id: 'skip', label: '不想说' },
      ] satisfies Choice[],
    },
    { id: 'ageRange', kind: 'range', title: '你希望对方大概多大？', privacy: '仅用于匹配，不会公开展示' },
    { id: 'height', kind: 'number', title: '你有多高？', caption: '默认厘米' },
    {
      id: 'heightMatch',
      kind: 'single',
      title: '你希望对方大概多高？',
      options: [
        { id: '150_165', label: '150–165 cm' },
        { id: '165_175', label: '165–175 cm' },
        { id: '175_185', label: '175–185 cm' },
        { id: '185_plus', label: '185 cm 以上' },
        { id: 'dont_care', label: '身高无所谓', emoji: '🤷' },
      ] satisfies Choice[],
    },
    { id: 'school', kind: 'school', title: '选择你的学校，完成校园验证', privacy: '校园邮箱 / 学生证占位' },
    { id: 'prefsIntro', kind: 'interstitial', title: '接下来聊聊你的偏好', illustration: '📒' },
    { id: 'email', kind: 'email', title: '你的邮箱是？', placeholder: 'you@email.com' },
    { id: 'emailOtp', kind: 'otp', title: '验证一下你的邮箱', privacy: '开发环境验证码会出现在提示里，不会假装已送达' },
    { id: 'work', kind: 'text', title: '你做什么工作？', placeholder: '例如：产品设计 / 研一' },
    {
      id: 'education',
      kind: 'single',
      title: '你的最高学历是？',
      options: [
        { id: 'high_school', label: '高中' },
        { id: 'college', label: '专科' },
        { id: 'bachelor', label: '本科' },
        { id: 'master', label: '硕士' },
        { id: 'phd', label: '博士' },
        { id: 'other', label: '其他' },
      ] satisfies Choice[],
    },
    {
      id: 'attribution',
      kind: 'single',
      title: '你是怎么知道我们的？',
      options: [
        { id: 'friend', label: '朋友推荐' },
        { id: 'social', label: '社交媒体' },
        { id: 'poster', label: '校园海报' },
        { id: 'search', label: '搜索引擎' },
        { id: 'event', label: '线下活动' },
        { id: 'other', label: '其他' },
      ] satisfies Choice[],
    },
    { id: 'opener', kind: 'text', title: '对方该先知道你的哪一面？', placeholder: '一句话就好' },
    {
      id: 'dealbreakers',
      kind: 'multi',
      wide: true,
      title: '雷区：不如见一面该避开什么？',
      options: [
        { id: 'smoking', label: '抽烟' },
        { id: 'late', label: '不守时' },
        { id: 'hookup_only', label: '只想约炮' },
        { id: 'cold', label: '冷暴力' },
        { id: 'values', label: '价值观不合' },
        { id: 'other', label: '其他' },
      ] satisfies Choice[],
    },
    {
      id: 'intent',
      kind: 'single',
      title: '此刻你想找什么？',
      options: [
        { id: 'serious', label: '认真恋爱' },
        { id: 'casual', label: '先处着看' },
        { id: 'friends', label: '交朋友' },
        { id: 'unsure', label: '不确定，随缘' },
      ] satisfies Choice[],
    },
    {
      id: 'matchPace',
      kind: 'single',
      title: '希望匹配节奏怎样？',
      options: [
        { id: 'faster', label: '多见面、快一点' },
        { id: 'slower', label: '稳一点、慢慢来' },
        { id: 'fate', label: '看缘分就行' },
      ] satisfies Choice[],
    },
    {
      id: 'budget',
      kind: 'single',
      title: '第一次见面预算（每人）？',
      options: [
        { id: 'under_50', label: '¥50 以内' },
        { id: '50_100', label: '¥50–100' },
        { id: '100_200', label: '¥100–200' },
        { id: '200_plus', label: '¥200+' },
        { id: 'split', label: 'AA 随缘' },
      ] satisfies Choice[],
    },
    {
      id: 'eduImportance',
      kind: 'single',
      title: '对方学历对你有多重要？',
      options: [
        { id: 'low', label: '不重要' },
        { id: 'some', label: '有点在意' },
        { id: 'high', label: '比较看重' },
        { id: 'must', label: '必须同层次' },
      ] satisfies Choice[],
    },
    { id: 'photos', kind: 'photos', title: '放几张能代表你的照片', privacy: '上传和人脸核验仍是占位' },
    { id: 'hobbyRanking', kind: 'rank', title: '给爱好排个优先级' },
  ],
  specialties: SPECIALTIES,
}

export const SLOT_PRESETS: Record<string, { weekday: number; startMin: number; endMin: number; note: string }> = {
  fri_pm: { weekday: 5, startMin: 14 * 60, endMin: 18 * 60, note: '周五下午' },
  fri_eve: { weekday: 5, startMin: 18 * 60 + 30, endMin: 21 * 60, note: '周五晚上' },
  sat_am: { weekday: 6, startMin: 10 * 60, endMin: 12 * 60, note: '周六上午' },
  sat_pm: { weekday: 6, startMin: 14 * 60, endMin: 18 * 60, note: '周六下午' },
  sat_eve: { weekday: 6, startMin: 18 * 60 + 30, endMin: 21 * 60, note: '周六晚上' },
  sun_am: { weekday: 7, startMin: 10 * 60, endMin: 12 * 60, note: '周日上午' },
  sun_pm: { weekday: 7, startMin: 14 * 60, endMin: 18 * 60, note: '周日下午' },
  sun_eve: { weekday: 7, startMin: 18 * 60 + 30, endMin: 21 * 60, note: '周日晚上' },
}

export function isCustomInterest(id: string): boolean {
  return id.startsWith('custom:') && id.slice('custom:'.length).trim().length > 0
}

export function isStructuredHobby(id: string): boolean {
  return HOBBY_IDS.includes(id)
}

export interface NormalizedInterests {
  interests: string[]
  specialties: Record<string, string[]>
}

/** Keeps selection order. Custom hobbies have no specialty. Friday never asks ethnicity. */
export function normalizeInterests(
  rawInterests: string[],
  rawSpecialties: Record<string, string[] | undefined> | undefined,
): { ok: true; value: NormalizedInterests } | { ok: false; message: string } {
  const interests: string[] = []
  for (const id of rawInterests) {
    if (!interests.includes(id)) interests.push(id)
  }
  if (!interests.length) return { ok: false, message: '至少选一个爱好' }
  for (const id of interests) {
    if (!isStructuredHobby(id) && !isCustomInterest(id)) {
      return { ok: false, message: '爱好不在名单里' }
    }
  }
  const specialties: Record<string, string[]> = {}
  for (const hobby of interests.filter(isStructuredHobby)) {
    const card = SPECIALTIES[hobby]
    const allowed = new Set(card.options.map((option) => option.id).filter((id) => id !== 'other'))
    const picks = rawSpecialties?.[hobby] ?? []
    const cleaned: string[] = []
    for (const pick of picks) {
      if (pick.startsWith('other:')) {
        const text = pick.slice('other:'.length).trim()
        if (!text) return { ok: false, message: '其他需要写几个字' }
        const stored = `other:${text}`
        if (!cleaned.includes(stored)) cleaned.push(stored)
      } else if (allowed.has(pick)) {
        if (!cleaned.includes(pick)) cleaned.push(pick)
      } else {
        return { ok: false, message: '兴趣分支选项不对' }
      }
    }
    if (!cleaned.length) return { ok: false, message: '把兴趣分支选完' }
    specialties[hobby] = cleaned
  }
  return { ok: true, value: { interests, specialties } }
}
