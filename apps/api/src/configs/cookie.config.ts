import { registerAs } from '@nestjs/config'
import { z } from 'zod'

export const cookieSchema = z.object({
  secret: z.string()
})

export type CookieConfigType = z.infer<typeof cookieSchema>

export const cookieConfig = registerAs(
  'cookie',
  (): CookieConfigType =>
    cookieSchema.parse({
      secret: process.env.COOKIE_SECRET
    })
)
