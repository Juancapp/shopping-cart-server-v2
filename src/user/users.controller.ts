import { Body, Controller, Post, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(
    @Body()
    user,
  ): Promise<User> {
    return this.userService.createUser(user);
  }

  @Get(':userName')
  async findUser(
    @Param('userName')
    name: string,
  ): Promise<User> {
    return this.userService.getUser(name);
  }

  @Patch('addOne/:userId/:productId')
  async addOneItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.addOneItem(userId, productId);
  }

  @Patch('add/:userId/:productId/:quantity')
  async addItems(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Param('quantity') quantity: string,
  ): Promise<User> {
    return this.userService.addItems(userId, productId, parseInt(quantity));
  }

  @Patch('remove/:userId/:productId')
  async removeOneItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.removeOneItem(userId, productId);
  }

  @Patch('removeAll/:userId/:productId')
  async removeAllItems(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.removeAllItems(userId, productId);
  }
}
