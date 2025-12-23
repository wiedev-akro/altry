import { registerAs } from '@nestjs/config'
import { z } from 'zod'

export const appSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z
    .preprocess(v => (typeof v === 'string' ? parseInt(v, 10) : v), z.number())
    .default(3000),
  prefix: z.object({
    rest: z.string().default('rest'),
    graphql: z.string().default('graphql')
  }),
  isProduction: z.boolean().default(false)
})

export type AppConfigType = z.infer<typeof appSchema>

export const appConfig = registerAs(
  'app',
  (): AppConfigType =>
    appSchema.parse({
      host: process.env.HOST,
      port: process.env.PORT,
      prefix: {
        rest: process.env.REST_PREFIX,
        graphql: process.env.GRAPHQL_PREFIX
      },
      isProduction: process.env.NODE_ENV === 'production'
    })
)
