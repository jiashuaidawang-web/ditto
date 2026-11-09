import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { dropInstants, previousWeekKey, shanghaiWeekKey } from '../src/common/shanghai-time'
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

interface SeedUser {
  openid: string
  displayName: string
  schoolId: string
  schoolName: string
  grade: number
  major: string
}

const USERS: SeedUser[] = [
  { openid: 'seed_a', displayName: '安安', schoolId: 'fudan', schoolName: '复旦大学', grade: 2, major: '新闻' },
  { openid: 'seed_b', displayName: '柏柏', schoolId: 'fudan', schoolName: '复旦大学', grade: 3, major: '计算机' },
  { openid: 'seed_c', displayName: '陈陈', schoolId: 'fudan', schoolName: '复旦大学', grade: 2, major: '社会学' },
  { openid: 'seed_d', displayName: '丁丁', schoolId: 'nju', schoolName: '南京大学', grade: 2, major: '物理' },
]

async function upsertUser(seed: SeedUser) {
  const user = await prisma.user.upsert({
    where: { openid: seed.openid },
    create: { openid: seed.openid, studentVerified: true, sessionKey: 'stub-session-key' },
    update: { studentVerified: true },
  })
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      displayName: seed.displayName,
      schoolId: seed.schoolId,
      schoolName: seed.schoolName,
      grade: seed.grade,
      major: seed.major,
      preferences: { intent: 'friends', interests: ['散步'], pace: 'slow' },
    },
    update: {
      displayName: seed.displayName,
      schoolId: seed.schoolId,
      schoolName: seed.schoolName,
      grade: seed.grade,
      major: seed.major,
    },
  })
  await prisma.availabilitySlot.deleteMany({ where: { userId: user.id } })
  await prisma.availabilitySlot.createMany({
    data: [
      { userId: user.id, weekday: 3, startMin: 19 * 60, endMin: 21 * 60, note: '周三晚' },
      { userId: user.id, weekday: 6, startMin: 14 * 60, endMin: 17 * 60, note: '周六下午' },
    ],
  })
  return user
}

async function main() {
  const users = new Map<string, { id: string }>()
  for (const seed of USERS) {
    users.set(seed.openid, await upsertUser(seed))
  }

  const prevKey = previousWeekKey(shanghaiWeekKey())
  const instants = dropInstants(prevKey)
  const cycle = await prisma.dropCycle.upsert({
    where: { weekKey: prevKey },
    create: {
      weekKey: prevKey,
      cutoffAt: instants.cutoffAt,
      releaseAt: instants.releaseAt,
      phase: 'closed',
    },
    update: { phase: 'closed' },
  })
  const userAId = users.get('seed_a')!.id
  const userCId = users.get('seed_c')!.id
  const [left, right] = userAId < userCId ? [userAId, userCId] : [userCId, userAId]
  await prisma.matchPair.upsert({
    where: { dropCycleId_userAId_userBId: { dropCycleId: cycle.id, userAId: left, userBId: right } },
    create: {
      dropCycleId: cycle.id,
      userAId: left,
      userBId: right,
      schoolId: 'fudan',
      gradeGap: 0,
      reason: 'seed: previous week pair so this week cannot rematch',
      status: 'feedback_done',
    },
    update: {},
  })
  console.log(`seeded ${USERS.length} users; previous cycle ${prevKey} blocks seed_a x seed_c`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
