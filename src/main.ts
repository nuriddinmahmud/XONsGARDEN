import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 📌 Ruxsat berilgan originlar
  const allowedOrigins = [
    'http://localhost:5173', // Vite
    'http://localhost:5174', // boshqa frontend port
    'https://13.49.137.12',  // server IP (SSL bilan)
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('❌ Blocked by CORS:', origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
   });

  // 📘 Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle("XON's Garden API")
    .setDescription('Auto-generated Swagger documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Server running on port ${PORT}`);
}

bootstrap();

