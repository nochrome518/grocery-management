import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Status } from 'src/models/enums/status.enum';
import { UserType } from 'src/models/enums/user-type.enum'

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'uid', type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
    uid: string;

    @Column({ name: 'full_name', length: 50, nullable: true  })
    fullName: string;

    @Column({ name: 'display_name', nullable: true })
    displayName: string;

    @Column({ name: 'cart_id', nullable: true })
    cartId: number;

    @Column({ name: 'email', nullable: true })
    email: string;

    @Column({ name: 'password', nullable: true })
    password: string;

    @Column({ name: 'phone_no', nullable: true })
    phoneNumber: string;

    @Column({ name: 'dob', nullable: true })
    dob: string;

    @Column({ name: 'country', nullable: true })
    country: string;

    @Column({ name: 'address_line', nullable: true })
    addressLine: string;

    @Column({ name: 'city', nullable: true })
    city: string;

    @Column({ type: 'varchar', default: UserType.Appuser })
    type: UserType;

    @Column({ type: 'int', default: Status.Active })
    status: Status;

    @Column({ name: 'created_by', nullable: true })
    createdBy: number;

    @CreateDateColumn({ name: 'created_date', type: 'datetime', update: false })
    createdDate: Date;

    @Column({ name: 'updated_by', nullable: true })
    updatedBy: number;

    @UpdateDateColumn({ name: 'updated_date', type: 'datetime', nullable: true })
    updatedDate: Date;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: number;

    @DeleteDateColumn({ name: 'deleted_date', type: 'datetime', nullable: true })
    deletedDate: Date;

}