import { Request } from "express";
import { User } from "src/users/user.entity";

export interface AuthorizedReqType extends Request {
    user: User
}