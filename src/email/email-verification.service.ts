import { BadRequestException, ForbiddenException, Injectable, NotAcceptableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign, verify } from "jsonwebtoken";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { EmailService } from './email.service'

@Injectable()
export class EmailVerificationService {

    constructor(
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService
    ){}

    sendVerificationLink(email: string){
        const token = sign(
            { email },
            this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') }
        )
        const url = `http://localhost:3000/email/confirm-email-token?token=${token}`
        const text = `Welcome to todo app. To confirm your email address, click on this link : \n ${url}`
        console.log('email verification text is : ', text)

        return this.emailService.sendMail({
            to : email,
            subject: 'Email verification',
            text
        })
    }

    async decodeConfirmationToken(confirMationToken: string){
        console.log(confirMationToken)
        try {
            const decoded: any = verify(
                confirMationToken,
                this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            )
            if(typeof decoded === 'object' && 'email' in decoded) return decoded.email as string
        } catch (error) {
            if(error?.name === 'TokenExpiredError'){
                throw new NotAcceptableException('Email confirmation token expired')
            }
            throw new BadRequestException('Unable to verify token')
        }
    }

    async resendVerificationLink(decoded: User){
        const user = await this.usersService.findUserByEmail(decoded.email)
        console.log('user email confirmed', user)
        if(user.emailIsConfirmed) throw new ForbiddenException('email is already confirmed')
        const { email } = user
        await this.sendVerificationLink(email)
        return 'email verification link was successfulluy resend'
    }
}