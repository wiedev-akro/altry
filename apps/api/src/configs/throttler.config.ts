import { registerAs } from '@nestjs/config'
import { z } from 'zod'

export const throttlerSchema = z.object({
  ttl: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(60000),
  limit: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(10)
})

export type ThrottlerConfigType = z.infer<typeof throttlerSchema>

export const throttlerConfig = registerAs(
  'throttler',
  (): ThrottlerConfigType =>
    throttlerSchema.parse({
      ttl: process.env.THROTTLER_TTL,
      limit: process.env.THROTTLER_LIMIT
    })
)
