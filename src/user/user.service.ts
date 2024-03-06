import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { S3 } from 'aws-sdk';
import { Base64 } from 'aws-sdk/clients/ecr';

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
    try {
      if (quantity === 0) return this.removeOneItem(userId, productId);

      const user = await this.userModel
        .findOneAndUpdate(
          { _id: userId, 'products.product': productId },
          { $set: { 'products.$.quantity': quantity } },
          { new: true },
        )
        .exec();

      if (user) {
        return user;
      } else {
        throw new Error(
          `No se encontró un usuario con el ID ${userId} y el producto ID ${productId}`,
        );
      }
    } catch (error) {
      throw new Error(`Error al actualizar el producto: ${error.message}`);
    }
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

  async uploadPicture(
    bucketName: string,
    key: string,
    file_in_base64_string: Base64,
  ) {
    const region = process.env.AWS_BUCKET_REGION;
    const accessKey = process.env.AWS_ACCESS_KEY;
    const secretKey = process.env.AWS_SECRET_KEY;

    try {
      const s3 = new S3({
        region: region,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      });

      const base64Data = Buffer.from(file_in_base64_string, 'base64');

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      };

      return await s3.upload(params).promise();
    } catch (error) {
      throw error;
    }
  }
}
