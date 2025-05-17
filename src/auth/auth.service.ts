import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private userRepository: UsersRepository) {}

    async create(createUserDto: CreateUserDto) {
            
            const existingUser = await this.prisma.user.findFirst({       // Доделать в UserRepository
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
    
            return this.userRepository.create(createUserDto, hashedPassword)
    }

    async login(loginUserDto: LoginUserDto) {
            const user = await this.prisma.user.findUnique({ // доделать в UserRepository
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
