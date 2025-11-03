import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ĐÚNG: Dùng process.cwd() để lấy root project
  const uploadDir = join(process.cwd(), 'uploads');
  
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Serve file tĩnh
  app.use('/uploads', require('express').static(uploadDir));

  console.log('Serving uploads from:', uploadDir); // Kiểm tra đường dẫn

  // CORS
  app.enableCors({ origin: '*', credentials: true });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        for (const err of errors) {
          if (err.constraints) {
            const firstMessage = Object.values(err.constraints)[0];
            return new BadRequestException(firstMessage);
          }
        }
        return new BadRequestException('Dữ liệu không hợp lệ');
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();