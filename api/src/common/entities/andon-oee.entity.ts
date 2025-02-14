import { Exclude } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SiteEntity } from "./site.entity";
import { OeeEntity } from "./oee.entity";


@Entity('andonOees')
export class AndonOeeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200 })
    groupName: string;

    @Column({ type: 'int' })
    oeeId: number;

    @ManyToOne(() => OeeEntity, (oee) => oee.andonOee, { onDelete: 'CASCADE' })
    oee: OeeEntity;

    @Exclude()
    @Column({ default: false })
    deleted: boolean;

    @Column({ type: 'int' })
    siteId: number;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;
}