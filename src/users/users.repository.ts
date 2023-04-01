import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AbstractRepository } from "src/common/abstract.repository";
import { User } from "./user.entity";

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
    constructor(
        @InjectModel(User.name) userModel: Model<User>
    ){
        super(userModel)
    }
}