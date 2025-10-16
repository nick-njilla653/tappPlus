import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? ['https://meditache.com']
      : ['http://localhost:5500', 'http://localhost:5550'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Configuration des pipes de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Meditache API')
    .setDescription('API pour la gestion des rappels d\'interventions médicales')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuration du préfixe global
  app.setGlobalPrefix('api/v1');

  const port = process.env.API_PORT || 5550;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  await app.listen(port, host);

  console.log(`🚀 API Meditache démarrée sur le port ${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://${host}:${port}/api/docs`);
}

bootstrap();
