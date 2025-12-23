import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const helmetConfigSchema = z.object({
  contentSecurityPolicy: z
    .preprocess(v => (typeof v === 'string' ? v === 'true' : v), z.boolean())
    .default(false),
  crossOriginEmbedderPolicy: z
    .preprocess(v => (typeof v === 'string' ? v === 'true' : v), z.boolean())
    .default(false),
  crossOriginOpenerPolicy: z
    .preprocess(v => (typeof v === 'string' ? v === 'true' : v), z.boolean())
    .default(true),
  crossOriginResourcePolicy: z
    .preprocess(v => (typeof v === 'string' ? v === 'true' : v), z.boolean())
    .default(true)
})

export type HelmetConfigType = z.infer<typeof helmetConfigSchema>

export const helmetConfig = registerAs(
  'helmet',
  (): HelmetConfigType =>
    helmetConfigSchema.parse({
      contentSecurityPolicy: process.env.HELMET_CSP,
      crossOriginEmbedderPolicy: process.env.HELMET_COEP,
      crossOriginOpenerPolicy: process.env.HELMET_COOP,
      crossOriginResourcePolicy: process.env.HELMET_CORP
    })
)
