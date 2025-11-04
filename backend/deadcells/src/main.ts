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
    // Lấy lỗi đầu tiên (thay vì gộp tất cả)
    for (const err of errors) {
      if (err.constraints) {
        const firstMessage = Object.values(err.constraints)[0];
        return new BadRequestException(firstMessage);
      }
    }
    // fallback nếu không có lỗi nào rõ ràng
    return new BadRequestException('Dữ liệu không hợp lệ');
  },

  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
