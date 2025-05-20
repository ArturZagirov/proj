import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
                private userRepository: UsersRepository,
                private jwtService: JwtService,) {}


    private readonly ACCESS_TOKEN_SECRET = 'SECRETACCESS'; 
    private readonly REFRESH_TOKEN_SECRET = 'SECRETREFRESH'; 
    private readonly ACCESS_TOKEN_EXPIRATION = '15m'; 
    private readonly REFRESH_TOKEN_EXPIRATION = '7d'; 



    async create(createUserDto: CreateUserDto) {
            
        const existingUser = await this.userRepository.findFirst(createUserDto.login, createUserDto.email)

        if (existingUser) {
            throw new ConflictException("ERROR User already registered ")
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

        // const [accessToken, refreshToken] = this.getTokens()
    
        await this.userRepository.create(createUserDto, hashedPassword) // Доделать // Создается

        
        return this.login({login: createUserDto.login,
                           password: createUserDto.password
                    })
    }





    async login(loginUserDto: LoginUserDto) {                  // Доделать
        const isMatch = this.validateUser(loginUserDto)

        if (!isMatch) {
            throw new UnauthorizedException("Invalid login or password")
        }
        const user = await this.prisma.user.findFirst({          
            where: {login: loginUserDto.login},
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

        if (!user) {
            throw new UnauthorizedException("ERROR")
        }

         const tokens = this.getTokens(user)

         const accessToken = (await tokens).accessToken
         const refreshToken = (await tokens).refreshToken

         return {
            accessToken,
            refreshToken
         }
    }





    async validateUser(loginUserDto: LoginUserDto) {    // доделать в UserRepository
        const user = await this.prisma.user.findUnique({
            where: {login: loginUserDto.login}
        })

        if (!user) {
            return null
        }

        const isMatch = await bcrypt.compare(loginUserDto.password, user.password)

        if (!isMatch) {
            return null
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            age: user.age,
            description: user.description,
        }
    }






    async getTokens(user: any) {
        const payload = {sub: user.id,
                         email: user.email,
        }

        const accessToken = this.jwtService.sign(payload, {
            secret: this.ACCESS_TOKEN_SECRET,
            expiresIn: this.ACCESS_TOKEN_EXPIRATION
        })
        
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.REFRESH_TOKEN_SECRET,
            expiresIn: this.REFRESH_TOKEN_EXPIRATION
        })
        
        const hashedRefresh = await bcrypt.hash(refreshToken, 10)
        this.userRepository.updateRefresh(+user.id, hashedRefresh)

        return {
            accessToken,
            refreshToken,
        }
    }






    async updateRefreshToken(userId: string, refreshToken: string) {
         const user = await this.userRepository.findOne(+userId);
        // const isMatch = await bcrypt.compare(refreshToken, user)
        if (!user || !user.refresh) {
            throw new ConflictException("ERROR")
        }
        const isMatch = await bcrypt.compare(refreshToken, user.refresh)

        if (!isMatch) {
            throw new ConflictException("Invalid refresh token")
        }

        const tokens = this.getTokens(user);
        const accessToken = (await tokens).accessToken
        const refresh = (await tokens).refreshToken

        return {
            accessToken,
            refreshToken: refresh,
        }
    }



    async logout(userId: string) {
        return this.userRepository.updateRefresh(+userId, null)  //  Доделать
    }
}
