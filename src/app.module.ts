import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { databaseConfig } from './config/configuration'
import { SequelizeModule } from '@nestjs/sequelize'
import { SequelizeConfigService } from './config/sequelizeConfig.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useClass: SequelizeConfigService,
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
