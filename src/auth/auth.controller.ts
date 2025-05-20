import { Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, Session, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { Response, Request, response } from 'express';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() createUserDto: CreateUserDto,
                   @Res({passthrough: true}) response: Response) {

        const tokens = this.authService.create(createUserDto)

        response.cookie('refresh_token', (await tokens).refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return {accessToken: (await tokens).accessToken}
    }




    @Get("refresh")
    async refresh(@Req() request: Request,
                  @Res() response: Response) {

        const refreshToken = request.cookies['refresh_token']

        if (!refreshToken) {
        throw new UnauthorizedException('Refresh токен отсутствует');
        }

        try {
            const decoded = this.authService['jwtService'].decode(refreshToken)

            if(!decoded || !decoded['sub']) {
                throw new ConflictException("INVALID TOKEN")
            }

            const tokens = await this.authService.updateRefreshToken(decoded['sub'], refreshToken)


        response.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return response.json({ accessToken: tokens.accessToken })


        } catch(error) {
            throw new UnauthorizedException('Не удалось обновить токены');
        }
    }







    @Post("login")
    async login(@Body() loginUserDto: LoginUserDto,
                @Res() response: Response) {
        const tokens = this.authService.login(loginUserDto);

        response.cookie('refresh_token', (await tokens).refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return {accessToken: (await tokens).accessToken}
    }


    @Post("logout")
    async logout(@Req() req: Request) {
        const refresh = req.cookies['refresh_token']
        const decoded = this.authService['jwtService'].decode(refresh)
        return this.authService.logout(decoded['sub'])
    }
}
