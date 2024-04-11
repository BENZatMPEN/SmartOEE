import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OeeEntity } from "./oee.entity";
import { OeeMachineEntity } from "./oee-machine.entity";
import { Exclude } from "class-transformer";

@Entity('oeeMachinePlannedDowntime')
export class OeeMachinePlannedDowntimeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    oeeId: number;

    @ManyToOne(() => OeeEntity, (oee) => oee.oeeMachinePlannedDowntime, { onDelete: 'CASCADE' })
    oee: OeeEntity;

    @Column({ type: 'int' })
    oeeMachineId: number;

    @ManyToOne(() => OeeMachineEntity, (oeeMachine) => oeeMachine.oeeMachinePlannedDowntime, { onDelete: 'CASCADE' })
    oeeMachine: OeeMachineEntity;

    @Column({ type: 'int' })
    plannedDownTimeId: number;

    @Column({ type: 'boolean' })
    fixTime: boolean;

    @Column({ type: 'datetime' })
    startDate: Date;

    @Column({ type: 'datetime' })
    endDate: Date;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;

    @Exclude()
    @Column({ default: false })
    deleted: boolean;
}