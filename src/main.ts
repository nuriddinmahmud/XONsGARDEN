import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Ruxsat berilgan CORS manzillar
  const allowedOrigins = [
    'http://localhost:5173',   // frontend (Vite, React)
    'http://localhost:5000',   // Swagger (lokal)
    'http://127.0.0.1:5000',   // Swagger (alternativ IP)
  ];

  // ✅ CORS konfiguratsiyasi
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  // ✅ Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle("XON's Garden API")
    .setDescription('Auto-generated Swagger documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document);

  // ✅ Serverni ishga tushurish (port 5000)
  await app.listen(5000);
}
bootstrap();
