import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-items.entity';
  
@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'user_id', type: 'int' })
    userId: number;
  
    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalPrice: number;
  
    @Column({ type: 'nvarchar', length: 50, default: 'created' })
    status: string;
  
    @CreateDateColumn({ name: 'created_date', type: 'datetime' })
    createdDate: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: number;
  
    @UpdateDateColumn({ name: 'updated_date', type: 'datetime' })
    updatedDate: Date;

    @Column({ name: 'updated_by', nullable: true })
    updatedBy: number;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    orderItems: OrderItem[];
}
  