import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                login: true,
                email: true,
                age: true,
                description: true,
            }
        })
    }


    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {id: id},
            select: {
                id: true,
                login: true,
                email: true,
                password: true,
                age: true,
                description: true,
                createdAt: true,
                updateAt: true,
            }
        })

        if(!user) {
            throw new NotFoundException("Not found User")
        }

        return user
    }

    async remove(id: number) {
        await this.findOne(id)

        return this.prisma.user.delete({
            where: {id}
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto) {         // Доделать с хэш

        await this.findOne(id);

        if (updateUserDto.login || updateUserDto.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        updateUserDto.login ? {login: updateUserDto.login} : {},
                        updateUserDto.email ? {login: updateUserDto.email} : {},
                    ],
                    NOT: {
                        id,
                    }
                }
            })

            if (existingUser) {
                throw new ConflictException('ERROR ');
              }
        }

        const user = await this.prisma.user.findUnique({
                where: {id: id},
                select: {
                password: true
                }
            });

            const password = user?.password;

            if (!password) {
                throw new Error('ERROR '); }

            const hashedPassword = await bcrypt.hash(password, 10)


        return this.prisma.user.update({
            where: {id},
            data:  {...updateUserDto,
                    password: hashedPassword
            },
            select: {
                id: true,
                login: true,
                email: true,
                age: true,
                description: true,
                createdAt: true,
                updateAt: true,
            }
        })
    }

    async getMyProfile(userId: number) {
        return this.findOne(userId);
      }

    async paginate(take: number, page: number) {
        return this.prisma.user.findMany({
            skip: take * (page-1),
            take: take,
            select: {
                id: true,
                login: true,
                email: true,
                age: true,
                description: true,
            }
        })
    }
}

