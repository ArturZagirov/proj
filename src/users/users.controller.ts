import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Session, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response, Request, response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService,
                private usersRepository: UsersRepository,
                private authService: AuthService) {}



    @Get()
    findAll() {
        return this.usersRepository.findAll()
    }

    @Get('pag')
    paginate(@Query("take") take: string, @Query("page") page: string) {       
        return this.usersService.paginate(+take, +page)
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

    @Delete('soft/:id')
    softDelete(@Param('id') id: string) {
        return this.usersService.softDelete(+id)
    }


    @UseGuards(JwtAuthGuard)
    @Get('profile/my')
    getMyProfile(@Req() req: Request) {
        const refresh = req.cookies['refresh_token']
        const decoded = this.authService['jwtService'].decode(refresh)
        return req.user
    }
}
