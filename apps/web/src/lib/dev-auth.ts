import { db } from './db'

export const DEV_USER_ID = 'dev-user-001'

export async function ensureDevUser() {
  await db.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: {
      id: DEV_USER_ID,
      email: 'dev@fieldkit.local',
      name: 'Dev User',
    },
  })
}
