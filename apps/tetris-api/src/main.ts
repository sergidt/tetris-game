/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebsocketProperties } from '@tetris-game/models';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Use WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || WebsocketProperties.port;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );

  const serverUrl = await app.getUrl();
  logger.log(`🚀 HTTP server running on: ${serverUrl}`);
  logger.log(`🔌 WebSocket server running on: ws://${serverUrl.split('//')[1]}`);
}

bootstrap();
