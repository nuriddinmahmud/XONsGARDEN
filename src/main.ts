import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import helmet from 'helmet';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔒 Xavfsizlikni oshirish uchun Helmet
  app.use(helmet());

  // ✅ CORS sozlamalari
  app.use(
    cors({
      origin: ['http://localhost:5174'], // Ruxsat etilgan domenlar
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // 🔍 Ma'lumotlarni validatsiya qilish uchun pipelar
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Kiritilmagan maydonlarni avtomatik olib tashlaydi
      forbidNonWhitelisted: true, // Noto‘g‘ri maydonlar bo‘lsa xatolik chiqaradi
      transform: true, // Request parametrlari avtomatik to‘g‘ri formatga o‘tkaziladi
    }),
  );

  // 🚀 Serverni ishga tushirish
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`✅ Server running on port ${PORT}`);
}

bootstrap();
