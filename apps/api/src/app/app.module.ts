import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DataloaderType, PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius'
import { ThrottlerModule } from '@nestjs/throttler'
import { RedisModule } from '@songkeys/nestjs-redis'
import { FastifyReply, FastifyRequest } from 'fastify'

import {
  appConfig,
  AppConfigType,
  cookieConfig,
  corsConfig,
  databaseConfig,
  DatabaseConfigType,
  helmetConfig,
  redisConfig,
  RedisConfigType,
  throttlerConfig,
  ThrottlerConfigType
} from '../configs'
import { ThrottlerGuard } from '../guards'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        cookieConfig,
        corsConfig,
        databaseConfig,
        helmetConfig,
        redisConfig,
        throttlerConfig
      ],
      expandVariables: true
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const throttlerConfig =
          configService.getOrThrow<ThrottlerConfigType>('throttler')

        return {
          throttlers: [
            {
              ttl: throttlerConfig.ttl,
              limit: throttlerConfig.limit
            }
          ]
        }
      },
      inject: [ConfigService]
    }),
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.getOrThrow<AppConfigType>('app')

        return {
          autoSchemaFile: appConfig.isProduction ? false : 'schema.gql',
          sortSchema: false,
          subscription: true,
          graphiql: !appConfig.isProduction,
          introspection: !appConfig.isProduction,
          context: (request: FastifyRequest, reply: FastifyReply) => {
            return {
              request,
              reply
            }
          }
        }
      },
      inject: [ConfigService]
    }),
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      useFactory: (configService: ConfigService) => {
        const databaseConfig =
          configService.getOrThrow<DatabaseConfigType>('database')

        return {
          driver: PostgreSqlDriver,

          dbName: databaseConfig.name,
          schema: databaseConfig.schema,
          host: databaseConfig.host,
          port: databaseConfig.port,
          user: databaseConfig.user,
          password: databaseConfig.password,

          discovery: {
            warnWhenNoEntities: false
          },

          // NestJS-specific options
          allowGlobalContext: false,
          registerRequestContext: true,
          autoLoadEntities: true,
          dataloader: DataloaderType.ALL,

          extensions: []
        }
      },
      inject: [ConfigService]
    }),
    RedisModule.forRootAsync(
      {
        useFactory: (configService: ConfigService) => {
          const redisConfig = configService.getOrThrow<RedisConfigType>('redis')

          return {
            config: {
              namespace: redisConfig.namespace,
              host: redisConfig.host,
              port: redisConfig.port,
              username: redisConfig.user,
              password: redisConfig.password
            }
          }
        },
        inject: [ConfigService]
      },
      true
    ),
    EventEmitterModule.forRoot()
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
