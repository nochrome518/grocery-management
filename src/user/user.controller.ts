import { Controller, Get, Post, Body, Param, Delete, Query, Req, Patch, SetMetadata, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequest } from 'src/models/requests/create-user.request';
import { UserLoginRequest } from 'src/models/requests/user-login.request';
import { UpdateUserRequest } from 'src/models/requests/update-user.request';
import { SearchUserRequest } from 'src/models/requests/search-user.request copy';
import { Request } from 'express';
import { RoleGuard } from 'src/utilities/guards/role.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('register')
    createUser(@Body() createUserRequest: CreateUserRequest): Promise<any> {
        return this.userService.createUser(createUserRequest);
    }

    @Post('login')
    userLoginWithEmail(@Body() userLoginRequest: UserLoginRequest): Promise<any> {
        return this.userService.userLogin(userLoginRequest);
    }

    @Patch(':id')
    updateUser(@Body() updateUserRequest: UpdateUserRequest, @Param('id') id: number, @Req() req: Request): Promise<any> {
        return this.userService.updateUserById(updateUserRequest, id, req.user);
    }

    @SetMetadata('isAdminRoute', true)
    @UseGuards(RoleGuard)
    @Delete(':id')
    deleteUser(@Param('id') id: number, @Req() req: Request): Promise<any> {
        return this.userService.deleteUserById(id, req.user);
    }

    @SetMetadata('isAdminRoute', true)
    @UseGuards(RoleGuard)
    @Post('list')
    getUserReport(@Body() userReportRequest: SearchUserRequest, @Req() req: Request): Promise<any> {
        return this.userService.getUsersList(userReportRequest, req.user);
    }
}
