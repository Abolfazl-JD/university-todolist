import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EmailVerificationService } from './email-verification.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [EmailController],
  providers: [EmailService, EmailVerificationService],
  exports: [EmailVerificationService]
})
export class EmailModule {}
