import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
                private userRepository: UsersRepository,
                private jwtService: JwtService,
                private config: ConfigService) {}



    async create(createUserDto: CreateUserDto) {
            
        const existingUser = await this.userRepository.findFirst(createUserDto.login, createUserDto.email)

        if (existingUser) {
            throw new ConflictException("ERROR User already registered ")
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    
        await this.userRepository.create(createUserDto, hashedPassword) 

        
        return this.login({login: createUserDto.login,
                           password: createUserDto.password
                    })
    }





    async login(loginUserDto: LoginUserDto) {                  
        const isMatch = this.validateUser(loginUserDto)

        if (!isMatch) {
            throw new UnauthorizedException("Invalid login or password")
        }

        const user = await this.userRepository.findFirstLogin(loginUserDto.login)

        if (!user) {
            throw new UnauthorizedException("User Not Found")
        }

         const tokens = await this.getTokens(user)

         const accessToken = tokens.accessToken
         const refreshToken = tokens.refreshToken

         return {
            accessToken,
            refreshToken
         }
    }





    async validateUser(loginUserDto: LoginUserDto) {    

        const user = await this.userRepository.findFirstLogin(loginUserDto.login)

        if (!user) {
            return null
        }

        const isMatch = await bcrypt.compare(loginUserDto.password, user.password)

        if (!isMatch) {
            return null
        }

        return user
    }






    async getTokens(user: any) {
        const payload = {sub: user.id,
                         email: user.email,
        }

        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get("ACCESS_TOKEN_SECRET"),                                 //this.ACCESS_TOKEN_SECRET,                                                    
            expiresIn: this.config.get("ACCESS_TOKEN_EXPIRATION")                           //this.ACCESS_TOKEN_EXPIRATION                                                      
        })
        
        const refreshToken = this.jwtService.sign(payload, {
            secret:  this.config.get("REFRESH_TOKEN_SECRET"),                               // this.REFRESH_TOKEN_SECRET,                                                                 
            expiresIn:  this.config.get("REFRESH_TOKEN_EXPIRATION"),                        //this.REFRESH_TOKEN_EXPIRATION                                                          
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
            throw new ConflictException("User OR Token Not Found")
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refresh)

        if (!isMatch) {
            throw new ConflictException("Invalid refresh token")
        }

        const tokens = await this.getTokens(user);
        const accessToken = tokens.accessToken
        const refresh = tokens.refreshToken

        return {
            accessToken,
            refreshToken: refresh,
        }
    }



    async logout(userId: string) {
        return this.userRepository.updateRefresh(+userId, null)  //  Доделать
    }
}
