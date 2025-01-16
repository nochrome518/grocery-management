import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/entities/user.entity';
import { CommonServices } from 'src/utilities/common-service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DateTimeService } from 'src/utilities/date-time.service';
import { JWTokenModule } from 'src/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  AuthModule,
  JWTokenModule
  ],
  providers: [UserService, CommonServices, AuthService, DateTimeService],
  controllers: [UserController]
})
export class UserModule {}
