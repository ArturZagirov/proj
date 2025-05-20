import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";


@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

    async findAll() {
    return this.prisma.user.findMany({
        where: {deleted: false},
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
                deleted: true,
                refresh: true,
            }
        })
        return user
    }

    async delete(id: number) {
        return this.prisma.user.delete({
            where: {id}
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto, hashedPassword?: string) {
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

    async create(createUserDto: CreateUserDto, hashedPassword: string, ) {
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                }
        })
    }

    async softDelete(id: number) {
        return this.prisma.user.update({
            where: {id: id},
            data: {deleted: true}
        })
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where :{email: email},
            // select: {
            //     id: true,
            //     login: true,
            //     email: true,
            //     age: true,
            //     description: true,
            //     createdAt: true,
            //     updateAt: true,
            // }
        })
    }

    async findByLogin(login: string) {
        return this.prisma.user.findUnique({
            where: {login: login},
            // select: {
            //     id: true,
            //     login: true,
            //     email: true,
            //     age: true,
            //     description: true,
            //     createdAt: true,
            //     updateAt: true,
            //     }
        })
    }

    async findFirst(login: string, email: string) {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    {login: login},
                    {email: email}
                ]
            }
        })
    }

    async updateRefresh(id: number, refreshToken: string | null) {
        return this.prisma.user.update({
            where: {id: id},
            data: {refresh: refreshToken},
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

    async findExistingUser(login: string | undefined, email: string | undefined, id: number) {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    login ? {login: login} : {},
                    email ? {email: email} : {},
                ],
                NOT: {
                    id,
                }
            }
        })
    }

    async getUserPassword(id: number) {
        return this.prisma.user.findUnique({
            where: {id: id},
            select: {
                password: true
            }
        })
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

    async findFirstLogin(login: string) {
        return this.prisma.user.findFirst({          
            where: {login: login},
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
    }
}