import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";


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
            }
        })
        return user
    }

    async delete(id: number) {
        return this.prisma.user.delete({
            where: {id}
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto, hashedPassword: string) {
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

    async create(createUserDto: CreateUserDto, hashedPassword: string) {
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword
                }
        })
    }

    async softDelete(id: number) {
        return this.prisma.user.update({
            where: {id: id},
            data: {deleted: true}
        })
    }

}