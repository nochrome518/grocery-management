import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import  applicationConfig  from 'src/config/app.config';
import { CommonServices } from 'src/utilities/common-service';
import { DateTimeService } from 'src/utilities/date-time.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/models/entities/product.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Product])],
	controllers: [ProductController],
	providers: [ProductService, CommonServices, DateTimeService]
})
export class ProductModule {}
