import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { AuthModule } from '../auth/auth.module'
import { UserModel } from './user.model'

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [
    SequelizeModule.forFeature([UserModel]),
    forwardRef(() => AuthModule),
  ],
})
export class UserModule {
}
