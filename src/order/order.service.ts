import { Injectable, NotFoundException, NotAcceptableException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from 'src/models/entities/orders.entity';
import { OrderItem } from 'src/models/entities/order-items.entity';
import { Messages } from 'src/constants/messages';
import { CommonServices } from 'src/utilities/common-service';
import { OrderStatus } from 'src/models/enums/order-status.enum';
import { DateTimeService } from 'src/utilities/date-time.service';
import { CreateOrderRequest, SearchOrderRequest } from 'src/models/requests/orders.request';
import { AuthUser } from 'src/models/auth.user';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        private commonFunctionService: CommonServices,
        public dateTimeService: DateTimeService
    ) {}

    async createOrder(userId: number): Promise<any> {
        const order = await this.orderRepository.findOne({ where: { userId: userId, status: In([OrderStatus.Created, OrderStatus.InProgress]) }});
        console.log("order",order)
        if (order) {
        throw new NotAcceptableException(`Order is already ${order.status}, please cancel the existing order to create a new one.`);
        }

        const newOrder = this.orderRepository.create({ userId, totalPrice: 0, createdBy: userId });
        const createOrder = await this.orderRepository.save(newOrder);
        return this.commonFunctionService.successResponseWithData(Messages.ORDER_CREATED,{ orderId: createOrder.id })
    }

    async addItemToOrder(orderId: number, createOrder: CreateOrderRequest, userId: number): Promise<any> {
        const { productId, quantity, price } = createOrder;
        const order = await this.orderRepository.findOne({ where: { id: orderId, status: OrderStatus.Created }});
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const addItem = new OrderItem();
        addItem.orderId = orderId;
        addItem.productId = productId;
        addItem.quantity = quantity;
        addItem.price = price;
        addItem.createdBy = userId;
        
        const createItem = await this.orderItemRepository.save(addItem);
        order.totalPrice += quantity * price;
        order.updatedBy = userId;
        order.updatedDate = new Date(this.dateTimeService.currentDate())
        const currentOrder = Object.assign(order, createOrder);
        await this.orderRepository.save(currentOrder);
        return this.commonFunctionService.successResponseWithData(Messages.ORDER_ITEM_CREATED,{ orderId: Number(orderId), orderItemId: createItem.id })
    }

    async updateItemInOrder(orderId: number, updateOrder: CreateOrderRequest, userId: number): Promise<any> {
        const { productId, quantity } = updateOrder;
        const order = await this.orderRepository.findOne({ where: { id: orderId, status: OrderStatus.Created }, relations: ['orderItems'] });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const item = order.orderItems.find((orderItem) => orderItem.productId === productId);
        if (!item) {
            throw new NotFoundException(`Item with product ID ${productId} not found in order`);
        }
        const oldTotalPrice = item.quantity * item.price;
        const newTotalPrice = order.totalPrice - oldTotalPrice + (quantity * item.price)
        item.quantity = quantity;
        item.updatedBy = userId;
        item.updatedDate =  order.updatedDate = new Date(this.dateTimeService.currentDate());
        await this.orderItemRepository.save(item);

        order.totalPrice = newTotalPrice;
        order.updatedBy = userId;
        order.updatedDate = new Date(this.dateTimeService.currentDate())
        delete order.orderItems;
        const currentOrder = Object.assign(order, updateOrder);
        await this.orderRepository.save(currentOrder);
        return this.commonFunctionService.successResponseWithData(Messages.ORDER_ITEM_UPDATED,{ orderId: order.id, orderItemId: item.id })
    }

    async removeItemFromOrder(orderId: number, productId: number, userId: number): Promise<any> {
        const order = await this.orderRepository.findOne({ where: { id: orderId,  status: OrderStatus.Created }, relations: ['orderItems'] });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }
        console.log("order.orderItems",order.orderItems)
        console.log("productId",productId)
        const item = order.orderItems.find((orderItem) => {
            return orderItem.productId === Number(productId);
        });
        console.log("item",item)
        if (!item) {
            throw new NotFoundException(`Item with product ID ${productId} not found in order`);
        }

        await this.orderItemRepository.remove(item);
        order.totalPrice -= item.quantity * item.price;
        order.updatedBy = userId;
        order.updatedDate = new Date(this.dateTimeService.currentDate())
        await this.orderRepository.save(order);
        return this.commonFunctionService.successResponse(Messages.ORDER_ITEM_DELETED)
    }

    async cancelOrder(orderId: number, userId: number): Promise<any> {
        const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['orderItems']});
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        order.status = OrderStatus.Canceled;
        order.updatedBy = userId;
        order.updatedDate = new Date(this.dateTimeService.currentDate())
        await this.orderRepository.save(order);
        return this.commonFunctionService.successResponse(Messages.ORDER_ITEM_DELETED)
    }

    async getOrdersList(orderReportRequest: SearchOrderRequest, userId: number): Promise<any> {
        let take, skip;
        if (orderReportRequest.pageSize) {
            take = orderReportRequest.pageSize;
        }
        if (orderReportRequest.pageIndex) {
            skip = (orderReportRequest.pageIndex - 1) * orderReportRequest.pageSize;
        }
    
        const [userOrderData, total] = await this.orderRepository.findAndCount({
            where: { userId: userId, status: OrderStatus.Created }, 
            relations: ['orderItems'],
            take: take,
            skip: skip,
            order: { id: 'ASC' },
        });

        if (total === 0) {
            throw new HttpException(this.commonFunctionService.failureResponse(Messages.NO_DATA), HttpStatus.BAD_REQUEST,);
        }
        this.dateTimeService.convertProtoBufDateString(userOrderData);

        const customerResponseData: any = {
            orders: userOrderData,
            total: total,
            count: userOrderData.length,
            page: orderReportRequest.pageIndex || 1,
            pageCount: Math.ceil(total / take),
        };
        return this.commonFunctionService.successResponseWithData(Messages.USER_LIST, customerResponseData);
    }
}
