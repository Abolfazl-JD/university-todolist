import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthorizedReqType } from 'src/common/types/authorized-req.type';
import { AuthorizationGuard } from 'src/users/guards/authorization.guard';
import { UsersService } from 'src/users/users.service';
import { EmailConfirmationDto } from './email-confirmation.dto';
import { EmailVerificationService } from './email-verification.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserResponse } from 'src/common/types/responses/user.response';
import { NotAcceptableErrorResponse } from 'src/common/types/errors/not-acceptable-error.response';
import { BadRequestErrorResponse } from 'src/common/types/errors/bad-request-error.response';
import { ForbiddenErrorResponse } from 'src/common/types/errors/forbidden-error.response';
import { UnauthorizedErrorResponse } from 'src/common/types/errors/unauthorized-error.response';

@ApiTags('email')
@Controller('email')
export class EmailController {

    constructor(
        private readonly emailVerificationService: EmailVerificationService,
        private readonly usersService: UsersService
    ){}

    @Get('confirm-email-token')
    @ApiOkResponse({ description: 'token to send back to server', type: String })    
    @ApiQuery({
        name: 'token',
        required: true,
        example: 'token',
        description: 'token to verify email'
    })
    confirmEmail(@Query('token') token: string){
        return token
    }

    @Post('verify')
    @HttpCode(200)
    @ApiOkResponse({ description: 'email successfully confirmed', type: UserResponse })
    @ApiNotAcceptableResponse({ description: 'Email confirmation token expired', type: NotAcceptableErrorResponse })
    @ApiBadRequestResponse({ description: 'Unable to verify token', type: BadRequestErrorResponse })
    @ApiForbiddenResponse({ description: 'user email is already confirmed', type: ForbiddenErrorResponse })
    async confirm(@Body() emailConfirmationDto: EmailConfirmationDto){
        const email = await this.emailVerificationService.decodeConfirmationToken(emailConfirmationDto.token)
        return this.usersService.confirmUserEmail(email)
    }

    @UseGuards(AuthorizationGuard)
    @Post('resend-verification-link')
    @ApiCreatedResponse({ description: 'email sent again', type: String })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    resendConfirmationLink(@Req() req: AuthorizedReqType){
        return this.emailVerificationService.resendVerificationLink(req.user)
    }
}
