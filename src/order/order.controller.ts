import { Controller, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request } from 'express';
import { CreateOrderRequest, SearchOrderRequest } from 'src/models/requests/orders.request';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    async createOrder(@Req() req: Request) {
        return this.orderService.createOrder(req.user?.userId);
    }

    @Post(':id/items')
    async addItemToOrder(@Param('id') orderId: number, @Body() createOrder: CreateOrderRequest, @Req() req: Request) {
        console.log("orderId",orderId)
        return this.orderService.addItemToOrder(orderId, createOrder, req.user?.userId);
    }

    @Patch(':id/items')
    async updateItemInOrder(@Param('id') orderId: number, @Body() updateOrder: CreateOrderRequest, @Req() req: Request) {
        return this.orderService.updateItemInOrder(orderId, updateOrder, req.user?.userId);
    }

    @Delete(':id/items/:productId')
    async removeItemFromOrder(@Param('id') orderId: number, @Param('productId') productId: number, @Req() req: Request) {
        return this.orderService.removeItemFromOrder(orderId, productId, req.user?.userId);
    }

    @Delete('cancel/:orderId')
    async cancelOrder(@Param('orderId') orderId: number, @Req() req: Request) {
        return this.orderService.cancelOrder(orderId, req.user?.userId);
    }

    @Post('list')
    async getOrderReport(@Body() searchOrderRequest: SearchOrderRequest, @Req() req: Request): Promise<any> {
        return this.orderService.getOrdersList(searchOrderRequest, req.user?.userId,);
    }
}
