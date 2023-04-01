import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotAcceptableException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthorizedReqType } from "src/common/types/authorized-req.type";
import { TodosService } from "../todos.service";

@Injectable()
export class AccessTodoGuard implements CanActivate {

    constructor(private readonly todosService: TodosService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: AuthorizedReqType = context.switchToHttp().getRequest()
        const { id: todoId } = req.params

        const todo = await this.todosService.findOneById(todoId)
        console.log('todo owner', todo.owner._id.toString())
        console.log('req user id', req.user._id.toString())
        if(req.user._id.toString() !== todo.owner._id.toString())
            throw new NotAcceptableException('user doesn\'t own this todo')
            
        return true
    }
}