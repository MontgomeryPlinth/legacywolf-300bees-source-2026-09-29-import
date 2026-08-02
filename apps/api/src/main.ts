import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",").filter(Boolean) ?? false,
    credentials: true,
  });
  app.setGlobalPrefix("v1");
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Legacy Wolf API")
      .setVersion("1.0")
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup("v1/docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
