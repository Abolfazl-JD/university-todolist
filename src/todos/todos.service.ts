import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './todo.entity';
import { TodosRepository } from './todos.repository';
import { User } from 'src/users/user.entity';

@Injectable()
export class TodosService {
    constructor( private readonly todosRepository: TodosRepository ){}

    createTodo(todosDetails: CreateTodoDto, owner: User){
        return this.todosRepository.create({
            ...todosDetails,
            done: false,
            owner
        }, {})
    }

    async getTodos(taskName: string, owner: User){
        const todos: Todo[] = await this.todosRepository.find({
            task: { $regex: taskName, $options: 'i' },
            owner
        })
        return todos
    }

    async deleteTodo(id: string, owner: User){
        await this.todosRepository.findOneAndDelete({ _id: id, owner })
        return `document with id of ${id} was deleted successfully`
    }

    async updateTodo(id: string, updateTodoDto: UpdateTodoDto, owner: User){
        const newDocument: Todo = await this.todosRepository.findOneAndUpdate(
            { _id: id, owner },
            updateTodoDto
        )
        return newDocument
    }

    findOneById(id: string){
        return this.todosRepository.findOne({ _id: id })
    }
}
