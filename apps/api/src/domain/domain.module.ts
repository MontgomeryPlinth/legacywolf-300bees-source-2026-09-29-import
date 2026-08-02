import { Module } from "@nestjs/common";
import { DomainController } from "./domain.controller";
import { DomainService } from "./domain.service";
import { PlansModule } from "../plans/plans.module";
@Module({ imports: [PlansModule], controllers: [DomainController], providers: [DomainService] })
export class DomainModule {}
