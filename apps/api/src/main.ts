import { fastifyCookie } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifyHelmet } from '@fastify/helmet'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'

import { AppModule } from './app/app.module'
import {
  AppConfigType,
  CookieConfigType,
  CorsConfigType,
  HelmetConfigType
} from './configs'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({})
  )

  const configService = app.get(ConfigService)
  const appConfig = configService.getOrThrow<AppConfigType>('app')
  const cookieConfig = configService.getOrThrow<CookieConfigType>('cookie')
  const corsConfig = configService.getOrThrow<CorsConfigType>('cors')
  const helmetConfig = configService.getOrThrow<HelmetConfigType>('helmet')

  app.setGlobalPrefix(appConfig.prefix.rest)

  // Cookie
  await app.register(fastifyCookie, {
    secret: cookieConfig.secret
  })

  // Security
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: helmetConfig.contentSecurityPolicy,
    crossOriginEmbedderPolicy: helmetConfig.crossOriginEmbedderPolicy,
    crossOriginOpenerPolicy: helmetConfig.crossOriginOpenerPolicy,
    crossOriginResourcePolicy: helmetConfig.crossOriginResourcePolicy
  })

  // CORS
  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      // In development, allow all origins (for tunnel support)
      if (!appConfig.isProduction) {
        return callback(null, true)
      }

      // In production, check against configured origins
      if (!origin || corsConfig.origin.includes(origin)) {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'), false)
    },
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    maxAge: corsConfig.maxAge,
    credentials: corsConfig.credentials,
    exposedHeaders: corsConfig.exposedHeaders
  })

  app.enableShutdownHooks()

  await app.listen({ host: appConfig.host, port: appConfig.port })

  Logger.log(
    `🚀 Application is running on: http://${await app.getUrl()}/${appConfig.prefix.rest}`
  )
  Logger.log(
    `📚 GraphQL is available on: http://${await app.getUrl()}/${appConfig.prefix.graphql}`
  )
}

bootstrap().catch(err => {
  Logger.error('Failed to start application', err)
  process.exit(1)
})
