import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma } from '../src/generated/prisma/client'
import { PrismaClient } from '../src/generated/prisma/client'
import { findSchool } from '../src/schools/catalog'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

interface SeedUser {
  phone: string
  email: string
  displayName: string
  schoolId: string
  grade: number
  gender: string
}

const USERS: SeedUser[] = [
  {
    phone: '13800001001',
    email: 'linxia@demo.aiditto.cn',
    displayName: '林夏',
    schoolId: 'cnu_liangxiang',
    grade: 2,
    gender: 'female',
  },
  {
    phone: '13800001002',
    email: 'zhouyu@demo.aiditto.cn',
    displayName: '周予',
    schoolId: 'cnu_liangxiang',
    grade: 3,
    gender: 'male',
  },
]

const LEGACY_OPENIDS = ['seed_a', 'seed_b', 'seed_c', 'seed_d']

async function removeLegacy() {
  const legacy = await prisma.user.findMany({
    where: { openid: { in: LEGACY_OPENIDS } },
    select: { id: true },
  })
  const ids = legacy.map((user) => user.id)
  if (!ids.length) return
  await prisma.feedback.deleteMany({ where: { userId: { in: ids } } })
  await prisma.matchPair.deleteMany({
    where: { OR: [{ userAId: { in: ids } }, { userBId: { in: ids } }] },
  })
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
}

async function upsertUser(seed: SeedUser) {
  const school = findSchool(seed.schoolId)
  if (!school) throw new Error(`unknown school ${seed.schoolId}`)
  const preferences = {
    intent: 'serious',
    lookingFor: ['any'],
    interests: ['cooking'],
    interestBranch: { hobby: 'cooking', style: 'home', detail: '' },
    questionnaireComplete: true,
  } satisfies Prisma.InputJsonValue
  const user = await prisma.user.upsert({
    where: { phone: seed.phone },
    create: {
      phone: seed.phone,
      email: seed.email,
      phoneVerified: true,
      emailVerified: true,
      studentVerified: true,
    },
    update: {
      email: seed.email,
      phoneVerified: true,
      emailVerified: true,
      studentVerified: true,
    },
  })
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      displayName: seed.displayName,
      gender: seed.gender,
      schoolId: school.id,
      schoolName: school.name,
      grade: seed.grade,
      preferences,
    },
    update: {
      displayName: seed.displayName,
      gender: seed.gender,
      schoolId: school.id,
      schoolName: school.name,
      grade: seed.grade,
      preferences,
    },
  })
  await prisma.availabilitySlot.deleteMany({ where: { userId: user.id } })
  await prisma.availabilitySlot.create({
    data: { userId: user.id, weekday: 6, startMin: 14 * 60, endMin: 17 * 60, note: '周六下午' },
  })
  return user
}

async function main() {
  await removeLegacy()
  for (const seed of USERS) {
    await upsertUser(seed)
  }
  console.log('seeded Fangshan pair: 13800001001 林夏 (首师大良乡, 大二) and 13800001002 周予 (首师大良乡, 大三)')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
