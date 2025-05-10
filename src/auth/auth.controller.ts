import { Body, Controller, HttpCode, HttpStatus, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() createUserDto: CreateUserDto, @Session() session: Record<string, any>) {
        const user = await this.authService.create(createUserDto)
        session.userId = user.id;
    
        const {password, ...result} = user;
        return result
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto, @Session() session: Record<string, any>) {
        const user = await this.authService.login(loginUserDto)
        session.userId = user.id;
        return user
    }
}
