import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private usersRepository: UsersRepository) {}

    async findOne(id: number) {
        const user = await this.usersRepository.findOne(id)

        if(!user) {
            throw new NotFoundException("Not found User")
        }
        return user
    }




    async remove(id: number) {
        await this.findOne(id)

        return this.usersRepository.delete(id)
    }





    async update(id: number, updateUserDto: UpdateUserDto) {         // Доделать с хэш

        await this.findOne(id)

        if (updateUserDto.login || updateUserDto.email) {
            const existingUser = await this.usersRepository.findExistingUser(updateUserDto.login, updateUserDto.email, id)

            if (existingUser) {
                throw new ConflictException('ERROR ');
              }
        }

        const user = await this.usersRepository.getUserPassword(id)

        const password = user?.password;

        if (!password) {
            throw new Error('ERROR '); }

        const hashedPassword = await bcrypt.hash(password, 10)

        return this.usersRepository.update(id, updateUserDto, hashedPassword)
    }





    async getMyProfile(userId: number) {
        return this.usersRepository.findOne(userId);
      }






    async paginate(take: number, page: number) {    // Доделать с UserRepo
        return this.usersRepository.paginate(take, page)
    }



    
    async softDelete(id: number) {
        return this.usersRepository.softDelete(id)
    }
}

