import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, UsersRepository],
    imports: [UsersModule],
})
export class AuthModule {}
