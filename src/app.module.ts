import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './models/entities/user.entity';
import * as dotenv from 'dotenv';
import { UserModule } from './user/user.module';
import { MiddlewareService } from './auth/nest-middleware';
import { JwtMiddlewareService } from './auth/jwt-middleware';
import { JWTokenModule } from './jwt/jwt.module';
import { ProductModule } from './product/product.module';
import { Product } from './models/entities/product.entity';
import { OrderController } from './order/order.controller';
import { OrderModule } from './order/order.module';
import { Order } from './models/entities/orders.entity';
import { OrderItem } from './models/entities/order-items.entity';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      synchronize: false,
      entities: [User, Product, Order, OrderItem],
      // logging: ['query', 'error'], 
    }),
    UserModule,
    JWTokenModule,
    ProductModule,
    OrderModule
  ],
  controllers: [AppController, OrderController],
  providers: [AppService],
})
export class AppModule implements NestModule  {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(MiddlewareService, JwtMiddlewareService)
    .forRoutes('*')
  }
}
