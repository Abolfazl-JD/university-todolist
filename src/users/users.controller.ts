import { Body, Controller, ForbiddenException, Get, HttpCode, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { unlinkSync } from 'fs';
import { isImageExtSafe, multerConfigOptions } from 'multer.config';
import { join } from 'path';
import { AuthorizedReqType } from 'src/common/types/authorized-req.type';
import { EmailVerificationService } from 'src/email/email-verification.service';
import { EmailConfirmationGuard } from 'src/email/guards/email-confirmation.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthorizationGuard } from './guards/authorization.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse, ApiConsumes, ApiBody, ApiNotAcceptableResponse, ApiProduces } from '@nestjs/swagger';
import { UserResponse } from 'src/common/types/responses/user.response';
import { BadRequestErrorResponse } from 'src/common/types/errors/bad-request-error.response';
import { NotFoundErrorResponse } from 'src/common/types/errors/not-found-error.response';
import { UnauthorizedErrorResponse } from 'src/common/types/errors/unauthorized-error.response';
import { ForbiddenErrorResponse } from 'src/common/types/errors/forbidden-error.response';
import { FileUploadDto } from './dto/file-upload.dto'
import { NotAcceptableErrorResponse } from 'src/common/types/errors/not-acceptable-error.response';

@ApiTags('users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly emailVerificationService: EmailVerificationService
    ){}
    
    /**
     * Register new user. note: after registeration complete; A verification link will be sent to the registered email
     */
    @Post('register')
    @ApiCreatedResponse({ description: 'user created', type: UserResponse })
    @ApiBadRequestResponse({ description: 'user you are trying to sign up has already been created', type: BadRequestErrorResponse })
    async signupUser(@Body() userInfo: RegisterUserDto, @Req() req: Request){
        const user = await this.authService.signup(userInfo)
        await this.emailVerificationService.sendVerificationLink(user.email)
        const { accessTokenCookie, refreshTokenCookie } = await this.authService.generateJWTCookies(user as User)
        req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        return user
    }

    @Post('login')
    @HttpCode(200)
    @ApiOkResponse({ description: 'User logged in successfully', type: UserResponse})
    @ApiNotFoundResponse({ description: "gmail not found", type: NotFoundErrorResponse })
    @ApiUnauthorizedResponse({ description: "password incorrect", type: UnauthorizedErrorResponse })
    async loginUser(@Body() userInfo: LoginUserDto, @Req() req: Request){
        console.log('login')
        const user = await this.authService.login(userInfo)
        const { accessTokenCookie, refreshTokenCookie } = await this.authService.generateJWTCookies(user as User)
        req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
        return user
    }

    @UseGuards(AuthorizationGuard, JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(200)
    @ApiOkResponse({ description: 'new authentication cookie has been set', type: UserResponse })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    @ApiForbiddenResponse({ description: 'refresh token did not match', type: ForbiddenErrorResponse })
    refresh(@Req() req: AuthorizedReqType){
        console.log('guard checking complete', req.user)
        const accessTokenCookie = this.authService.getJWTAccessTokenCookie(req.user.email)
        req.res.setHeader('Set-Cookie', accessTokenCookie)
        return req.user
    }

    @UseGuards(AuthorizationGuard)
    @Post('logout')
    @HttpCode(200)
    @ApiOkResponse({ description: 'You have been successfully logged out', type: String })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    async logoutUser(@Req() req: AuthorizedReqType){
        await this.usersService.removeRefreshTokenFromDatabase(req.user.email)
        req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogout())
        return 'You have been successfylly logged out'
    }

    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Patch(':id')
    @ApiParam({
        description: "User's id",
        required: true,
        example: '45dag4sgfs5',
        name: "id"
    })
    @ApiOkResponse({ description: 'user was updated successfully', type: UserResponse })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    @ApiForbiddenResponse({ description: 'gmail is not confirmed yet', type: ForbiddenErrorResponse })
    updateUser(@Param('id') id: string, @Body() userInfo: UpdateUserDto){
        return this.authService.updateUser(id, userInfo)
    }


    @UseGuards(AuthorizationGuard, EmailConfirmationGuard)
    @Post('upload-image')
    @HttpCode(200)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'List of cats',
        type: FileUploadDto,
    })
    @ApiOkResponse({ description: 'file uploaded successfully', type: UserResponse })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    @ApiForbiddenResponse({ description: 'gmail is not confirmed yet / the file content doesn\'t match its extension', type: ForbiddenErrorResponse })
    @ApiNotAcceptableResponse({ description: 'file must be a png or jpg/jpeg', type: NotAcceptableErrorResponse })
    @UseInterceptors(FileInterceptor('file', multerConfigOptions))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Req() request: AuthorizedReqType
    ){
        const fullFilePath = join(process.cwd(), 'src/users/images/', file.filename)
        // check if the file extension is safe
        const isImgExtSafe = await isImageExtSafe(fullFilePath)

        if(isImgExtSafe) return this.usersService.updateUserImage(request.user.email, file.filename)
        unlinkSync(fullFilePath)
        throw new ForbiddenException('the file content doesn\'t match its extension')
    }

    @UseGuards(AuthorizationGuard)
    @Get('image/:filename')
    @HttpCode(200)
    @ApiParam({
        name: 'filename',
        required: true,
        example: 'gf4ds5gfs465s.jpg',
        description: 'profile image path'
    })
    @ApiOkResponse({ description: 'profile image' })
    @ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
    @ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
    getImage(@Param('filename') filename: string, @Res() res: any){
        let imgPath = ''
        if(!filename || ['null', '[null]', 'undefined'].includes(filename))
            imgPath = 'default_profile_page.png'
        else imgPath = filename
        res.sendFile(imgPath, { root: './src/users/images' })
    }
}
