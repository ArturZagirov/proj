import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Session } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto, @Session() session: Record<string, any>) {
        const user = await this.usersService.create(createUserDto)
        session.userId = user.id;

        const {password, ...result} = user;
        return result
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto, @Session() session: Record<string, any>) {
        const user = await this.usersService.login(loginUserDto)
        session.userId = user.id;
        return user
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Session() session: Record<string, any>) {
        session.userId = null
    }

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.usersService.remove(+id)
    }
}
