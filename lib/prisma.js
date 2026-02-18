import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

console.log("DB:", process.env.DATABASE_URL)

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma;