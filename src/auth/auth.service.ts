import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
            
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        {login: createUserDto.login},
                        {email: createUserDto.email}
                    ],
                },
            })

            if (existingUser) {
                throw new ConflictException("ERROR User already registered ")
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    
            return this.prisma.user.create({
                data: {
                ...createUserDto,
                password: hashedPassword
                }
            })
    }

    async login(loginUserDto: LoginUserDto) {
            const user = await this.prisma.user.findUnique({
                where: {login: loginUserDto.login}
                }
            )
    
            //const isMatch = await bcrypt.compare(loginUserDto.password, user.password)
    
            if(!user || !await bcrypt.compare(loginUserDto.password, user.password)) { 
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


}
