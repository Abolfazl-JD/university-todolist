import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/email/email.module';
import { EmailConfirmationGuard } from 'src/email/guards/email-confirmation.guard';
import { AuthService } from './auth.service';
import { AuthorizationGuard } from './guards/authorization.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User, UserSchema } from './user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => EmailModule) 
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService,
    AuthService,
    UsersRepository,
    JwtRefreshGuard,
    EmailConfirmationGuard
  ],
  exports: [UsersService, AuthService]
})
export class UsersModule {}
