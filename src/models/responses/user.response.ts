import { User } from "src/models/entities/user.entity";

export class UserResponse {
    users: User[];
    total: number;
    count: number;
    page: number;
    pageCount?: number;
}