import { MikroORM } from '@mikro-orm/core'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { MigratorModule } from './migrator.module'

async function bootstrap() {
  const app = await NestFactory.create(MigratorModule)

  const orm = app.get(MikroORM)
  const migrator = orm.migrator

  try {
    await migrator.createMigration()
    Logger.debug('Migration created')

    await migrator.up()
    Logger.debug('Migrated!')
  } catch (error) {
    Logger.error('Migration failed', error)
    process.exit(1)
  } finally {
    await orm.close()
    process.exit(0)
  }
}

bootstrap().catch(err => {
  Logger.error('Failed to migrate database', err)
  process.exit(1)
})
