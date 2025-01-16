import { Controller, Patch, Post, Delete, Body, Param, Req, UseGuards, SetMetadata } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductRequest, SearchProductRequest, UpdateProductRequest } from 'src/models/requests/product.request';
import { Request } from 'express';
import { RoleGuard } from 'src/utilities/guards/role.guard';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService){}

    @SetMetadata('isAdminRoute', true)
    @UseGuards(RoleGuard)
    @Post('create')
    createProduct(@Body() createProductRequest: CreateProductRequest, @Req() req:Request): Promise<any> {
      	return this.productService.createProduct(createProductRequest, req.user);
    }

    @SetMetadata('isAdminRoute', true)
    @UseGuards(RoleGuard)
    @Patch(':id')
    updateProduct(@Body() updateProductRequest: UpdateProductRequest, @Param('id') id: number, @Req() req: Request): Promise<any> {
      	return this.productService.updateProductById(updateProductRequest, id, req.user);
    }

    @SetMetadata('isAdminRoute', true)
    @UseGuards(RoleGuard)
	@Delete(':id')
    deleteProduct(@Param('id') id: number, @Req() req:Request): Promise<any> {
      	return this.productService.deleteProductById(id, req.user);
    }

	@Post('list')
    getProductReport(@Body() productReportRequest: SearchProductRequest, @Req() req:Request): Promise<any> {
      	return this.productService.getProductList(productReportRequest, req.user);
    }
}
