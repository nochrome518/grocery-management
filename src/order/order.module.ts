import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/models/entities/orders.entity';
import { OrderItem } from 'src/models/entities/order-items.entity';
import { OrderController } from './order.controller';
import { CommonServices } from 'src/utilities/common-service';
import { DateTimeService } from 'src/utilities/date-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrderService, CommonServices, DateTimeService],
  controllers: [OrderController],
  exports: [OrderService]
})
export class OrderModule {}
