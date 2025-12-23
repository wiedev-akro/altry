import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const databaseConfigSchema = z.object({
  host: z.string(),
  port: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(5432),
  user: z.string(),
  password: z.string(),
  name: z.string(),
  schema: z.string().default('public')
})

export type DatabaseConfigType = z.infer<typeof databaseConfigSchema>

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfigType =>
    databaseConfigSchema.parse({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      name: process.env.DATABASE_NAME,
      schema: process.env.DATABASE_SCHEMA
    })
)
