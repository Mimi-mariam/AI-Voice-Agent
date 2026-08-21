import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({
  connectionString,
  ssl: true
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Seed "Mike's Business"
  const business = await prisma.business.upsert({
    where: { email: 'mike@example.com' },
    update: {},
    create: {
      name: "Mike's Business",
      email: 'mike@example.com',
      password: passwordHash,
      description: 'A professional consulting firm offering expert advice.',
      phone: '+15551234567',
      address: '123 Main St, Tech City',
      timezone: 'America/Los_Angeles',
      knowledgeBase: {
        create: [
          {
            title: 'Consultation',
            category: 'SERVICE',
            content: 'A 30-minute introductory consultation to discuss your needs. Price: $50.',
          },
          {
            title: 'Strategy Session',
            category: 'SERVICE',
            content: 'A comprehensive 1-hour strategy session. Price: $150.',
          },
          {
            title: 'Cancellation Policy',
            category: 'POLICY',
            content: 'Appointments must be cancelled at least 24 hours in advance for a full refund.',
          },
          {
            title: 'What are your hours?',
            category: 'FAQ',
            content: 'We are open Monday to Friday from 9 AM to 5 PM Pacific Time.',
          }
        ]
      }
    },
  })

  console.log('Database seeded with demo business:', business.name)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
