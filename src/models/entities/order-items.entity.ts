import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from './orders.entity';
  
@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id', type: 'int' })
    orderId: number;

    @Column({ name: 'product_id', type: 'int' })
    productId: number;
  
    @Column({ type: 'int' })
    quantity: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
  
    @CreateDateColumn({ name: 'created_date', type: 'datetime' })
    createdDate: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: number;
  
    @UpdateDateColumn({ name: 'updated_date', type: 'datetime', nullable: true })
    updatedDate: Date;

    @Column({ name: 'updated_by', nullable: true })
    updatedBy: number;
  
    @ManyToOne(() => Order, (order) => order.orderItems)
    @JoinColumn({ name: 'order_id' })
    order: Order;
    
}
  