import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Fazendinha API')
    .setDescription(
      'API de gestão de usuários, turmas, permissões, estações, temporadas, eventos climáticos, espécies, rebanhos, produções, culturas, fazendas, talhões, plantios e colheitas.',
    )
    .setVersion('1.0')
    .setContact(
      'Web Fazenda',
      'https://github.com/marco-pcg/Web-Fazenda',
      'web-fazenda@example.com',
    )
    .setLicense('UNLICENSED', 'https://github.com/marco-pcg/Web-Fazenda')
    .addServer('http://localhost:3000', 'Desenvolvimento local')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT gerado no endpoint /auth/login',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em: http://localhost:${port}`);
  console.log(`Swagger disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();
