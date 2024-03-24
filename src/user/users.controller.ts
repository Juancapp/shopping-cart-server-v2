import { Body, Controller, Post, Get, Param, Put, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { PaymentMethod } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(
    @Body()
    user,
  ): Promise<User> {
    return this.userService.getUser(user);
  }

  @Patch('/:id')
  async editUser(
    @Param('id')
    id,
    @Body()
    body,
  ) {
    return this.userService.editUser(id, body);
  }

  @Get(':userName')
  async findUser(
    @Param('userName')
    name: string,
  ): Promise<User> {
    return this.userService.getUser(name);
  }

  @Put('addOne/:userId/:productId')
  async addOneItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.addOneItem(userId, productId);
  }

  @Put('edit/:userId/:productId/:quantity')
  async editItems(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Param('quantity') quantity: string,
  ): Promise<User> {
    return this.userService.editItems(userId, productId, parseInt(quantity));
  }

  @Put('removeOne/:userId/:productId')
  async removeOneItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.removeOneItem(userId, productId);
  }

  @Put('removeAll/:userId/:productId')
  async removeAllItems(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<User> {
    return this.userService.removeAllItems(userId, productId);
  }

  @Put('buyItem/:userId/:productId/:quantity')
  async buyItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Param('quantity') quantity: number,
  ) {
    return this.userService.buyItem(userId, productId, quantity);
  }

  @Put('payment/:userId')
  async createPaymentMethod(
    @Param('userId') userId: string,
    @Body() body: PaymentMethod,
  ) {
    return this.userService.createPaymentMethod(userId, body);
  }

  @Put('paymentToDefault/:userId')
  async setItemToDefault(
    @Param('userId') userId: string,
    @Body() body: { number: string; expiryDate: string },
  ) {
    return this.userService.setPaymentToDefault(userId, body);
  }

  @Put('removePaymentMethod/:userId')
  async removePaymentMethod(
    @Param('userId') userId: string,
    @Body() body: { number: string },
  ) {
    return this.userService.removePaymentMethod(userId, body.number);
  }

  @Post('/picture')
  async uploadPicture(@Body() data: { userId: number; img: string }) {
    const tmp = await this.userService.uploadPicture(
      process.env.S3_BUCKET_NAME,
      `profile_image/${data.userId}.jpg`,
      data.img,
    );
    const photo_url = tmp.Location;
    return photo_url;
  }
}
