import { Body, Controller, Post, Get, Param, Put } from '@nestjs/common';
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
