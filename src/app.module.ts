import { Module, ValidationPipe } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, ConfigModule.forRoot({
      isGlobal: true, 
    })],
  controllers: [], 
  providers: [ 
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },], 
})
export class AppModule {}
