import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Messages } from 'src/constants/messages';
import { AuthUser } from 'src/models/auth.user';
import { CreateProductRequest, SearchProductRequest, UpdateProductRequest } from 'src/models/requests/product.request';
import { CommonServices } from 'src/utilities/common-service';
import { DateTimeService } from 'src/utilities/date-time.service';
import { Status } from 'src/models/enums/status.enum'
import { ProductResponse } from 'src/models/responses/product.response';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from 'src/models/entities/product.entity';

@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private commonFunctionService: CommonServices,
        public dateTimeService: DateTimeService
    ) {}

    async createProduct(createProductRequest: CreateProductRequest, user: AuthUser): Promise<any> {
        const createProduct: Product = createProductRequest as any;
        createProduct.createdBy = user.userId;
        await this.productRepository.save(createProduct)
        return this.commonFunctionService.successResponse(Messages.PRODUCT_CREATED);
    }

    async updateProductById(updateProductRequest: UpdateProductRequest, id: number, user: AuthUser): Promise<any> {
        const productData = await this.productRepository.find({ where: { id: id }}); 
        if(!productData){
            throw new UnauthorizedException(Messages.INVALID_PRODUCT);
        }

        let currentProduct: Product = productData[0];
        currentProduct.updatedBy = user.userId;
        currentProduct.updatedDate = new Date(this.dateTimeService.currentDate());
        currentProduct = Object.assign(currentProduct, updateProductRequest);
        await this.productRepository.save(currentProduct);
        return this.commonFunctionService.successResponse(Messages.PRODUCT_UPDATED);
    }

    async deleteProductById(id: number, user: AuthUser): Promise<any> {
        const productData = await this.productRepository.find({ where: { id: id }}); 
        if(!productData){
            throw new UnauthorizedException(Messages.INVALID_PRODUCT);
        }

        let currentUser: Product = productData[0];
        currentUser.status = Status.Deleted;
        currentUser.deletedBy = user.userId;
        currentUser.deletedDate = currentUser.updatedDate = new Date(this.dateTimeService.currentDate());
        await this.productRepository.save(currentUser);
        return this.commonFunctionService.successResponse(Messages.PRODUCT_DELETED);
    }

    async getProductList(productReportRequest: SearchProductRequest, user: AuthUser): Promise<any> {
        let take, skip;
        if (productReportRequest.pageSize) {
            take = productReportRequest.pageSize;
        }
        if (productReportRequest.pageIndex) {
            skip = (productReportRequest.pageIndex - 1) * productReportRequest.pageSize;
        }
        const whereClause: Record<string, any> = {};
        if (productReportRequest.id) whereClause.id = productReportRequest.id;
        if (productReportRequest.name) whereClause.fullName = ILike(`%${productReportRequest.name}%`);
        if (productReportRequest.category) whereClause.displayName = ILike(`%${productReportRequest.category}%`);
        if (productReportRequest.price) whereClause.cartId = productReportRequest.price;
        if (productReportRequest.status) whereClause.email = ILike(`%${productReportRequest.status}%`);
    
        // Fetch users from the database
        const [productListData, total] = await this.productRepository.findAndCount({
            where: whereClause,
            take: take,
            skip: skip,
            order: { id: 'ASC' },
        });
        if (total === 0) {
            throw new HttpException(this.commonFunctionService.failureResponse(Messages.NO_DATA), HttpStatus.BAD_REQUEST,);
        }
        this.dateTimeService.convertProtoBufDateString(productListData);

        const productResponseData: ProductResponse = {
          products: productListData,
          total: total,
          count: productListData.length,
          page: productReportRequest.pageIndex || 1,
          pageCount: Math.ceil(total / take),
        }
        return this.commonFunctionService.successResponseWithData(Messages.PRODUCT_LIST, productResponseData);
    }
}
