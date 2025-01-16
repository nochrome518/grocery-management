import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Messages } from 'src/constants/messages';
import { AuthUser } from 'src/models/auth.user';
import { User } from 'src/models/entities/user.entity';
import { Status } from 'src/models/enums/status.enum';
import { UserType } from 'src/models/enums/user-type.enum';
import { CreateUserRequest } from 'src/models/requests/create-user.request';
import { SearchUserBy, SearchUserRequest } from 'src/models/requests/search-user.request copy';
import { UpdateUserRequest } from 'src/models/requests/update-user.request';
import { UserLoginRequest } from 'src/models/requests/user-login.request';
import { UserResponse } from 'src/models/responses/user.response';
import { CommonServices } from 'src/utilities/common-service';
import { DateTimeService } from 'src/utilities/date-time.service';
import { ILike, Repository } from 'typeorm';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private commonFunctionService: CommonServices,
    private authService: AuthService,
    public dateTimeService: DateTimeService
  ) {}

    async createUser(createUserRequest: CreateUserRequest): Promise<any> {
        const userData = await this.userRepository.findOne({where: { email: createUserRequest.email }}); 
        if(userData){
            throw new UnauthorizedException(Messages.EMAIL_EXISTS);
        }

        const createUser: User = createUserRequest as any;
        const hashedPass = await this.authService.hashPassword(createUserRequest.password);
        createUser.password = hashedPass;
        await this.userRepository.save(createUser);
        return this.commonFunctionService.successResponse(Messages.USER_CREATED);
    }

    async userLogin(userLoginRequest: UserLoginRequest): Promise<any> {
        const userData = await this.userRepository.findOne({where: { email: userLoginRequest.email }}); 
        if(!userData){
            throw new UnauthorizedException(Messages.INVALID_USER_EMAIL);
        }

        const authResponse = await this.authService.validateUser(userData, userLoginRequest.password)
        return this.commonFunctionService.successResponseWithData(Messages.TOKEN_GENERATE,authResponse);
    }

    async updateUserById(updateUserRequest: UpdateUserRequest, id: number, user: AuthUser): Promise<any> {
        const userData = await this.userRepository.findOne({where: { id: id }}); 
        if(!userData){
            throw new UnauthorizedException(Messages.INVALID_USER);
        }

        let currentUser: User = userData;
        currentUser.updatedBy = user.userId;
        currentUser.updatedDate = new Date(this.dateTimeService.currentDate());
        currentUser = Object.assign(currentUser, updateUserRequest);
        await this.userRepository.save(currentUser);
        return this.commonFunctionService.successResponse(Messages.USER_UPDATED);
    }

    async deleteUserById(id: number, user: AuthUser): Promise<any> {
        const userData = await this.userRepository.findOne({where: { id: id }}); 
        if(!userData){
            throw new UnauthorizedException(Messages.INVALID_USER);
        }

        let currentUser: User = userData;
        currentUser.status = Status.Deleted;
        currentUser.deletedBy = user.userId;
        currentUser.deletedDate = currentUser.updatedDate = new Date(this.dateTimeService.currentDate());
        await this.userRepository.save(currentUser);
        return this.commonFunctionService.successResponse(Messages.USER_DELETED);
    }

    async getUsersList(userReportRequest: SearchUserRequest, user: AuthUser): Promise<any> {
        if(user.role != UserType.Admin){
            throw new UnauthorizedException(Messages.NO_PERMISSION);
        }

        let take, skip;
        if (userReportRequest.pageSize) {
            take = userReportRequest.pageSize;
        }
        if (userReportRequest.pageIndex) {
            skip = (userReportRequest.pageIndex - 1) * userReportRequest.pageSize;
        }
        const whereClause: Record<string, any> = {};
        if (userReportRequest.id) whereClause.id = userReportRequest.id;
        if (userReportRequest.fullName) whereClause.fullName = ILike(`%${userReportRequest.fullName}%`);
        if (userReportRequest.displayName) whereClause.displayName = ILike(`%${userReportRequest.displayName}%`);
        if (userReportRequest.cartId) whereClause.cartId = userReportRequest.cartId;
        if (userReportRequest.email) whereClause.email = ILike(`%${userReportRequest.email}%`);
        if (userReportRequest.phoneNumber) whereClause.phoneNumber = ILike(`%${userReportRequest.phoneNumber}%`);
        if (userReportRequest.type) whereClause.type = userReportRequest.type;
        if (userReportRequest.status) whereClause.status = userReportRequest.status;
    
        // Fetch users from the database
        const [userListData, total] = await this.userRepository.findAndCount({
            where: whereClause,
            take: take,
            skip: skip,
            order: { id: 'ASC' },
        });

        if (total === 0) {
            throw new HttpException(this.commonFunctionService.failureResponse(Messages.NO_DATA), HttpStatus.BAD_REQUEST,);
        }
        this.dateTimeService.convertProtoBufDateString(userListData);

        const customerResponseData: UserResponse = {
            users: userListData,
            total: total,
            count: userListData.length,
            page: userReportRequest.pageIndex || 1,
            pageCount: Math.ceil(total / take),
        };
        return this.commonFunctionService.successResponseWithData(Messages.USER_LIST, customerResponseData);
    }
}
