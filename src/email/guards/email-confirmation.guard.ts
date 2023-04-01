import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthorizedReqType } from "src/common/types/authorized-req.type";

export class EmailConfirmationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: AuthorizedReqType = context.switchToHttp().getRequest()

        if(!request.user?.emailIsConfirmed) throw new ForbiddenException('email is not confirmed yet')

        return true
    }
}