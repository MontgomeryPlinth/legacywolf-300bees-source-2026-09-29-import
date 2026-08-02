import { Module } from "@nestjs/common";
import { NominatedController } from "./nominated.controller";
import { NominatedService } from "./nominated.service";
@Module({ controllers: [NominatedController], providers: [NominatedService] })
export class NominatedModule {}
