import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path'; 
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      for (const err of errors) {
        if (err.constraints) {
          const firstMessage = Object.values(err.constraints)[0];
          return new BadRequestException(firstMessage);
        }
      }
      return new BadRequestException('Dữ liệu không hợp lệ');
    },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
