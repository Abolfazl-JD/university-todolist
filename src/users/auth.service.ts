import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign, verify } from "jsonwebtoken";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ){}

    async signup(userInfo: RegisterUserDto){
        const user = await this.usersService.findUserByEmail(userInfo.email)
        if(user) throw new BadRequestException('this user has already exsits')
        // hash password
        userInfo.password = await this.usersService.hashValue(userInfo.password)
        return this.usersService.saveUser(userInfo)
    }

    async login(userInfo: LoginUserDto){
        const { email, password: enteredPassword } = userInfo
        const user = await this.usersService.findUserByEmail(email)
        if(!user) throw new NotFoundException('There is no account with this email')
        // check password
        const isPasswordCorrect = await this.usersService.compareDataWithEncrypted(enteredPassword, user.password)
        if(!isPasswordCorrect) throw new UnauthorizedException('password incorrect')
        const { password, hashedRefreshToken , ...userWithoutPassword } = user
        return userWithoutPassword
    }

    async generateJWTCookies(user:  User){
        const accessTokenCookie = this.getJWTAccessTokenCookie(user.email)
        console.log('\n access token cookie is here', accessTokenCookie)
        const { cookie: refreshTokenCookie, token: refreshToken } = this.getCookieWithJWTRefreshToken(user.email)
        console.log('there is refresh cookie', refreshTokenCookie)
        await this.usersService.saveRefreshTokenToDatabase(refreshToken, user.email)
        return { accessTokenCookie, refreshTokenCookie }
    }

    getJWTAccessTokenCookie(userEmail: string){
        const token = sign(
            { email: userEmail },
            this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') }
        )
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`

    }

    getCookieWithJWTRefreshToken(userEmail: string){
        const token = sign(
            { email: userEmail },
            this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            { expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') }
        )
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`
        return { cookie, token }
    }


    async verifyAccessToken(token: string){
        try {
            const decodedToken: any = verify(
                token,
                this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            )
            console.log('decoded token',decodedToken)
            const { password, hashedRefreshToken, ...user } = await this.usersService.findUserByEmail(decodedToken.email as string)
            console.log('user ', user)
            return user
        } catch (error) {
            throw new BadRequestException('unable to verify token')
        }
    }

    getCookiesForLogout(){
        return [
            'Authentication=; HttpOnly; Path=/; Max-Age=0',
            'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ]
    }

    async updateUser(userId: string, userInfo: UpdateUserDto){
        const user = await this.usersService.findUserById(userId)
        console.log(user)
        if(!user) throw new NotFoundException(`User with id of ${userId} was not found`)
        // if trying to edit password, check the old password is correct
        if(userInfo.oldPassword){
            const isPasswordCorrect = this.usersService.compareDataWithEncrypted(userInfo.oldPassword, user.password)
            if(!isPasswordCorrect) throw new ForbiddenException('password incorrect')
            userInfo.password = await this.usersService.hashValue(userInfo.password)
        }
        // if trying to edit email, check email is not already in use
        if(userInfo.email){
            const foundUser = await this.usersService.findUserByEmail(userInfo.email)
            if(foundUser) throw new BadRequestException('the email you have entered is already in use')
        }
        // edit user
        return await this.usersService.updateUser(userId, { ...user, ...userInfo })
    }
}