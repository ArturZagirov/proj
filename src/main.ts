import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
// import cookieParser from 'cookie-parser';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // app.use(
  //   session({
  //     secret: 'my-secret',
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       maxAge: 3600000, // 1 час
  //     },
  //   }),
  // );
  app.use(cookieParser())
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
