import { registerAs } from '@nestjs/config'
import { z } from 'zod'

export const redisSchema = z.object({
  host: z.string().default('localhost'),
  port: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(6379),
  namespace: z.string().default('default'),
  user: z.string().default('default'),
  password: z.string()
})

export type RedisConfigType = z.infer<typeof redisSchema>

export const redisConfig = registerAs(
  'redis',
  (): RedisConfigType =>
    redisSchema.parse({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      namespace: process.env.REDIS_NAMESPACE,
      user: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD
    })
)
