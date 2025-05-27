import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // ✅ Qo‘shish kerak

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ GLOBAL VALIDATION PIPE — bu juda muhim!
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 👈 Bu `@Transform()` ishlashi uchun kerak
      whitelist: true, // DTO'da yo'q fieldlarni avtomatik olib tashlaydi
    }),
  );

  // 🔐 CORS konfiguratsiyasi
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://13.49.137.12',
      'http://13.49.137.12:80'

    ],
    credentials: true,
  });

  // 📘 Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle('XONs Garden API')
    .setDescription('XONs Garden loyihasi uchun REST API hujjatlari')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document);

  await app.listen(3000);
  console.log('🚀 Server is running at http://localhost:3000');
  console.log('📚 Swagger docs available at http://localhost:3000/xon');
}

bootstrap();
