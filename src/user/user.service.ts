import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async createUser(user: User): Promise<User> {
    const response = await this.userModel.create(user);
    return response;
  }

  async getUser(name: string): Promise<User> {
    const user = await this.userModel
      .findOne({
        name: name.toLocaleLowerCase(),
      })
      .populate({ path: 'products.product' });

    if (user) {
      return user;
    } else {
      const createdUser = await this.userModel.create({ name: name });
      return createdUser;
    }
  }

  async editItems(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<User> {
    if (quantity === 1) return this.addOneItem(userId, productId);
    if (quantity === 0) return this.removeAllItems(userId, productId);

    return this.userModel
      .findOne({ _id: userId, 'products.product': productId })
      .exec()
      .then((user) => {
        if (user) {
          return this.userModel
            .findOneAndUpdate(
              { _id: userId, 'products.product': productId },
              { $set: { 'products.$.quantity': quantity } },
              { new: true },
            )
            .exec();
        } else {
          return this.userModel
            .findOneAndUpdate(
              { _id: userId },
              {
                $push: { products: { product: productId, quantity: quantity } },
              },
              { new: true },
            )
            .exec();
        }
      });
  }

  async addOneItem(userId: string, productId: string): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'products.product': { $ne: productId } },
        { $push: { products: { product: productId, quantity: 1 } } },
        { new: true },
      )
      .exec()
      .then((user) => {
        if (user) return user;
        return this.userModel
          .findOneAndUpdate(
            { _id: userId, 'products.product': productId },
            { $inc: { 'products.$.quantity': 1 } },
            { new: true },
          )
          .exec();
      });
  }

  async removeOneItem(userId: string, productId: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'products.product': productId },
        { $inc: { 'products.$.quantity': -1 } },
        { new: true },
      )
      .exec();

    if (
      user.products.find((p) => p.product.toString() === productId).quantity ===
      0
    ) {
      await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          { $pull: { products: { product: Object(productId) } } },
          { new: true },
        )
        .exec();
    }

    return user;
  }

  async removeAllItems(userId: string, productId: string): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId },
        { $pull: { products: { product: productId } } },
        { new: true },
      )
      .exec();
  }
}
