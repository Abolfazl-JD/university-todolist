import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AbstractRepository } from "src/common/abstract.repository";
import { Todo } from "./todo.entity";

@Injectable()
export class TodosRepository extends AbstractRepository<Todo> {

    constructor(
        @InjectModel(Todo.name) todoModel: Model<Todo>
    ){
        super(todoModel)
    }
}