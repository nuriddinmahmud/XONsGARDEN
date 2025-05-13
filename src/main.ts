import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 CORS konfiguratsiyasi
  app.enableCors({
    origin: [
      'http://localhost:5173',     // Lokal frontend uchun
      'http://13.49.137.12',       // Server IP manzili
    ],
    credentials: true,             // Cookie-based auth uchun zarur
  });

  // 📘 Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle('XONs Garden API')
    .setDescription('XONs Garden loyihasi uchun REST API hujjatlari')
    .setVersion('1.0')
    .addBearerAuth() // JWT token bilan ishlash uchun
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document); // http://localhost:3000/api/docs

  await app.listen(3000);
  console.log('🚀 Server is running at http://localhost:3000');
  console.log('📚 Swagger docs available at http://localhost:3000/xon');
}

bootstrap();
