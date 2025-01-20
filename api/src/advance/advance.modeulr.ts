import { Module } from "@nestjs/common";
import { AdvanceController } from "./advance.controller";
import { AdvanceService } from "./advance.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiteEntity } from "src/common/entities/site.entity";
import { OeeEntity } from "src/common/entities/oee.entity";
import { OeeBatchEntity } from "src/common/entities/oee-batch.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SiteEntity,
            OeeEntity,
            ProductEntity,
            OeeBatchEntity,
            UserEntity
        ])
    ],
    controllers: [AdvanceController],
    providers: [AdvanceService]
})

export class AdvanceModule {}