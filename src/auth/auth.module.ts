import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CommonServices } from 'src/utilities/common-service';
import { JWTokenModule } from 'src/jwt/jwt.module';

@Module({
    imports: [JWTokenModule],
    controllers: [],
    providers: [AuthService, CommonServices],
})
export class AuthModule {
    
}