import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthorizationGuard implements CanActivate {

    constructor(private readonly authService: AuthService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        console.log('req cookies', req.cookies)
        if(!req.cookies?.Authentication) throw new UnauthorizedException('no cookies were found , consider signing up/in')
        console.log('authentication cookie ', req.cookies.Authentication)
        const { Authentication: accessToken } = req.cookies
        try {
            const user = await this.authService.verifyAccessToken(accessToken)
            req.user = user
            return true
        } catch (error) {
            throw new BadRequestException("couldn't verify token, consider logging in again")
        }
    }
}