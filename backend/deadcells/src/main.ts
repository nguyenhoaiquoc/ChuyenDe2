import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // loại bỏ các field không có trong DTO
    forbidNonWhitelisted: true, // ném lỗi nếu có field thừa
    transform: true,          // tự động chuyển kiểu dữ liệu
   exceptionFactory: (errors) => {
  const messages = errors
    .map(err => err.constraints ? Object.values(err.constraints) : [])
    .flat()
    .join(', ');
  return new BadRequestException(messages);
},

  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
