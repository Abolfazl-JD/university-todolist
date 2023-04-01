import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EmailConfirmationGuard } from 'src/email/guards/email-confirmation.guard';
import { AuthorizationGuard } from 'src/users/guards/authorization.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';
import { AuthorizedReqType } from 'src/common/types/authorized-req.type';
import { AccessTodoGuard } from './gurads/access-todo.guard';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Todo } from './todo.entity';
import { BadRequestErrorResponse } from 'src/common/types/errors/bad-request-error.response';
import { UnauthorizedErrorResponse } from 'src/common/types/errors/unauthorized-error.response';
import { ForbiddenErrorResponse } from 'src/common/types/errors/forbidden-error.response';
import { NotAcceptableErrorResponse } from 'src/common/types/errors/not-acceptable-error.response';
import { TodoResponse } from 'src/common/types/responses/todo.response';

@ApiTags('todos')
@UseGuards(AuthorizationGuard, EmailConfirmationGuard)
@Controller('todos')
@ApiForbiddenResponse({ description: 'gmail is not confirmed yet', type: ForbiddenErrorResponse })
@ApiUnauthorizedResponse({ description: "no cookies were found", type: UnauthorizedErrorResponse })
@ApiBadRequestResponse({ description: 'unable to verify token', type: BadRequestErrorResponse })
export class TodosController {

    constructor(private readonly todosService: TodosService){}

    @Post()
    @ApiCreatedResponse({ description: 'new work was added successfully', type: TodoResponse })
    addTodo(@Body() todoDetails: CreateTodoDto, @Req() req: AuthorizedReqType){
        return this.todosService.createTodo(todoDetails, req.user)
    }

    @Get()
    @ApiQuery({
        name: 'task_name',
        required: false,
        allowEmptyValue: true,
        example: 'shopping',
        description: 'name to search'
    })
    @ApiOkResponse({ description: 'An Array of todos were successfully fetched', type: TodoResponse, isArray: true })
    findTodos(@Query('task_name') task_name: string, @Req() req: AuthorizedReqType){
        if(!task_name) task_name = ''
        return this.todosService.getTodos(task_name, req.user)
    }

    @UseGuards(AccessTodoGuard)
    @Patch(':id')
    @ApiParam({
        name: 'id',
        description: 'id of todo to update',
        required: true,
        example: 'f45da6gfs76dsadsh'
    })
    @ApiOkResponse({ description: 'task was updated successfully', type: TodoResponse })
    @ApiNotAcceptableResponse({ description: 'user doesn\'t own this todo', type: NotAcceptableErrorResponse })
    updateTodo(
        @Param('id') id: string,
        @Body() updateTodoDto: UpdateTodoDto,
        @Req() req: AuthorizedReqType
    ){
        return this.todosService.updateTodo(id, updateTodoDto, req.user)
    }

    @UseGuards(AccessTodoGuard)
    @Delete(':id')
    @ApiParam({
        name: 'id',
        description: 'id of todo to delete',
        required: true,
        example: 'f45da6gfs76dsadsh'
    })
    @ApiOkResponse({ description: 'task was successfully deleted', type: String })
    @ApiNotAcceptableResponse({ description: 'user doesn\'t own this todo', type: NotAcceptableErrorResponse })
    deleteTodo(@Param('id') id: string, @Req() req: AuthorizedReqType){
        return this.todosService.deleteTodo(id, req.user)
    }
}
