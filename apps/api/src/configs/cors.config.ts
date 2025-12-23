import { registerAs } from '@nestjs/config'
import { z } from 'zod'

export const corsSchema = z.object({
  origin: z.preprocess(
    v =>
      typeof v === 'string'
        ? v
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
        : undefined,
    z.array(z.string()).default([])
  ),
  methods: z.preprocess(
    v =>
      typeof v === 'string'
        ? v
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
        : undefined,
    z.array(z.string()).default([])
  ),
  allowedHeaders: z.preprocess(
    v =>
      typeof v === 'string'
        ? v
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
        : undefined,
    z.array(z.string()).default([])
  ),
  maxAge: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(600),
  credentials: z
    .preprocess(v => (typeof v === 'string' ? v === 'true' : v), z.boolean())
    .default(true),
  exposedHeaders: z.preprocess(
    v =>
      typeof v === 'string'
        ? v
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
        : undefined,
    z.array(z.string()).default([])
  )
})

export type CorsConfigType = z.infer<typeof corsSchema>

export const corsConfig = registerAs(
  'cors',
  (): CorsConfigType =>
    corsSchema.parse({
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS,
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
      maxAge: process.env.CORS_MAX_AGE,
      credentials: process.env.CORS_CREDENTIALS,
      exposedHeaders: process.env.CORS_EXPOSED_HEADERS
    })
)
