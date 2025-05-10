import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Kengaytirilgan CORS konfiguratsiyasi
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost:5173')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // ✅ Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle("XON's Garden API")
    .setDescription('Auto-generated Swagger documentation')
    .setVersion('1.0')
    .addSecurityRequirements('bearer', ["bearer"])
    .addBearerAuth( )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('xon', app, document);

  await app.listen(5000);
}
bootstrap();
