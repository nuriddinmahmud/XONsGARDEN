import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS yoqilgan — asosiy domenlarga ruxsat
  app.enableCors({
    origin: [
      'http://localhost:5173',     // lokal frontend
      'http://13.49.137.12',       // server IP
    ],
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Server running on port 3000');
}
bootstrap();

