import { EntityGenerator } from '@mikro-orm/entity-generator'
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DataloaderType, PostgreSqlDriver } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { SeedManager } from '@mikro-orm/seeder'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'

import { databaseConfig, DatabaseConfigType } from '../configs/database.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      expandVariables: true
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

          migrations: {
            tableName: 'migration',
            path: join(process.cwd(), 'apps/api/migrations'),
            pathTs: join(process.cwd(), 'apps/api/migrations'),
            glob: '!(*.d).{js,ts}',
            transactional: true,
            disableForeignKeys: true,
            allOrNothing: true,
            dropTables: true,
            safe: false,
            snapshot: true,
            emit: 'ts' as const,
            generator: TSMigrationGenerator
          },

          seeder: {
            path: join(process.cwd(), 'apps/api/seeders'),
            pathTs: join(process.cwd(), 'apps/api/seeders'),
            glob: '!(*.d).{js,ts}',
            defaultSeeder: 'DatabaseSeeder',
            emit: 'ts' as const
          },

          allowGlobalContext: true,
          registerRequestContext: true,
          autoLoadEntities: true,
          dataloader: DataloaderType.ALL,

          metadataProvider: TsMorphMetadataProvider,
          extensions: [Migrator, EntityGenerator, SeedManager]
        }
      },
      inject: [ConfigService]
    })
  ]
})
export class MigratorModule {}
