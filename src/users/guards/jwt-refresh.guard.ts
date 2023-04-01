import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verify } from "jsonwebtoken";
import { UsersService } from "../users.service";

@Injectable()
export class JwtRefreshGuard implements CanActivate {

    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        console.log('req cookies:', req.cookies)
        if(!req.cookies?.Refresh) throw new UnauthorizedException('no cookies were found consider signing up/in')
        const { Refresh: refreshToken } = req.cookies

        try {
            const decoded: any = verify(refreshToken, this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'))
            console.log('decode data is : ', decoded)
            const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, decoded.email)
            if(!user) return false
            return true
        } catch (error) {
            throw new BadRequestException('unable to verify the token')
        }
    }
}