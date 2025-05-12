import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config(); // .env faylni yuklaydi

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Kengaytirilgan CORS ro‘yxati
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://13.49.137.12',
    'http://13.49.137.12:3000',
    'https://13.49.137.12',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true);
      } else {
        console.error('❌ Blocked by CORS:', origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  // ✅ Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle("XON's Garden API")
    .setDescription('Auto-generated Swagger documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document);

  // ✅ Portni .env dan o‘qish (fallback: 3000)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();

