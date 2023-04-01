import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( new ValidationPipe({
    whitelist: true
  }) )
  app.use(cookieParser())

  // swagger
  const config = new DocumentBuilder()
  .setTitle('Todo app server')
  .setDescription('in order to authorize routes , simply login or sign up nothing more !')
  .setVersion('1.0')
  .build()

  const document = SwaggerModule.createDocument(app, config)

  // remove the 201 status code from the login
  delete document.paths['/users/login']['post']['responses']['201']

  SwaggerModule.setup('api', app, document)

  await app.listen(3000);
}
bootstrap();
