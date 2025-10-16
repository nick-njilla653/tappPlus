import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://meditache.com'] 
      : ['http://localhost:5500', 'http://localhost:5550'],
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
  await app.listen(port);
  
  console.log(`🚀 API Meditache démarrée sur le port ${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/docs`);
}

bootstrap();
