import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {login: createUserDto.login},
                    {email: createUserDto.email}
                ]
            }
        })
        if (existingUser) {
            throw new ConflictException("ERROR User already registered ")
        }

        return this.prisma.user.create({
            data: createUserDto
        })
    }

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
                age: true,
                description: true,
                createdAt: true,
                updatedAt: true,
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
    async login(loginUserDto: LoginUserDto) {
        const user = await this.prisma.user.findUnique({
            where: {login: loginUserDto.login}
            }
        )

        if(!user || user.password !== loginUserDto.password) {
            throw new UnauthorizedException("Invalid login or password")
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            age: user.age,
            description: user.description,
          };
    }

    async update(id: number, updateUserDto: UpdateUserDto) {

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
        }
        return this.prisma.user.update({
            where: {id},
            data: updateUserDto,
            select: {
                id: true,
                login: true,
                email: true,
                age: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }
}
