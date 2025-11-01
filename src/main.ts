import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Serve static uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
    app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      console.log(`${method} ${originalUrl} => Status: ${statusCode} - ${duration}ms`);
    });
  next();
  });
  // 👇 Listen on all IPs, not just localhost
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
