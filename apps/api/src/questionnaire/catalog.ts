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
      kind: 'interests',
      title: '你有哪些爱好和兴趣？',
      caption: '可多选。选了上面的兴趣后会再问一小步；自己写的爱好不问。',
      customLabel: '写一个爱好',
      options: HOBBIES,
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
  specialties: SPECIALTIES,
}

export const SLOT_PRESETS: Record<string, { weekday: number; startMin: number; endMin: number; note: string }> = {
  sat_afternoon: { weekday: 6, startMin: 14 * 60, endMin: 17 * 60, note: '周六下午' },
  sun_afternoon: { weekday: 7, startMin: 14 * 60, endMin: 17 * 60, note: '周日下午' },
  wed_evening: { weekday: 3, startMin: 19 * 60, endMin: 21 * 60, note: '周三晚上' },
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
