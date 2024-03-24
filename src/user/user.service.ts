import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { S3 } from 'aws-sdk';
import { Base64 } from 'aws-sdk/clients/ecr';
import { FirstTime, PaymentMethod } from './user.entity';
import { isCardExpired } from '../helpers/date';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async createUser(user: User): Promise<User> {
    const response = await this.userModel.create({
      ...user,
      firstTime: FirstTime.FALSE,
    });
    return response;
  }

  async editUser(userId: string, body: Partial<User>): Promise<User> {
    const res = await this.userModel.findByIdAndUpdate(userId, body);
    return res;
  }

  async createPaymentMethod(
    userId: string,
    body: PaymentMethod,
  ): Promise<User> {
    const foundUser = (await this.userModel.findById(userId)).toObject();

    const paymentMethods = foundUser.paymentMethods;

    if (paymentMethods.length) {
      paymentMethods.forEach((paymentMethod, index) => {
        if (paymentMethod.number === body.number) {
          throw new BadRequestException('Same card already added');
        } else {
          if (body.isDefault && body.number !== paymentMethod.number) {
            paymentMethods[index] = {
              ...paymentMethods[index],
              isDefault: false,
            };
          }
        }
      });
      paymentMethods.push(body);
    } else {
      paymentMethods.push({ ...body, isDefault: true });
    }

    const res = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: { paymentMethods: paymentMethods },
      },
      {
        new: true,
      },
    );

    return res;
  }

  async setPaymentToDefault(
    userId: string,
    body: { number: string; expiryDate: string },
  ): Promise<User> {
    const { number, expiryDate } = body;

    if (isCardExpired(expiryDate)) {
      throw new BadRequestException('You can not set expired card as default');
    }

    const foundUser = (await this.userModel.findById(userId)).toObject();

    const paymentMethods = foundUser.paymentMethods;

    paymentMethods.forEach((paymentMethod, index) => {
      if (paymentMethod.number === number && paymentMethod.isDefault) {
        throw new BadRequestException('Payment method is already default');
      } else {
        paymentMethods[index] = {
          ...paymentMethods[index],
          isDefault: paymentMethod.number === number,
        };
      }
    });

    const res = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: { paymentMethods: paymentMethods },
      },
      {
        new: true,
      },
    );

    return res;
  }

  async removePaymentMethod(userId: string, number: string): Promise<User> {
    try {
      const foundUser = await this.userModel.findOne({
        _id: userId,
        'paymentMethods.number': number,
      });

      if (!foundUser) {
        throw new Error('User not found');
      }

      const foundPM = foundUser.paymentMethods.some(
        (paymentMethod) =>
          paymentMethod.number === number && paymentMethod.isDefault,
      );

      if (foundPM && foundUser.paymentMethods.length !== 1) {
        throw new Error('Default payment method can not be deleted');
      }

      return await this.userModel.findByIdAndUpdate(
        userId,
        {
          $pull: {
            paymentMethods: { number: number },
          },
        },
        {
          new: true,
        },
      );
    } catch (error) {
      return error;
    }
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
      const regExp = /^[a-zA-Z]+$/;
      if (!regExp.test(name) || name.length < 3) {
        throw new Error(
          'All characters must be letters and name must be equal or greater than 3',
        );
      }

      const createdUser = await this.userModel.create({
        name: name.toLowerCase(),
        firstTime: FirstTime.TRUE,
      });

      return createdUser;
    }
  }

  async editItems(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<User> {
    try {
      if (quantity < 0) throw new Error('Quantity must be greater than 0');
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
          `User with ${userId} and product id ${productId} not found`,
        );
      }
    } catch (error) {
      throw new Error(`Error updating the product: ${error.message}`);
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

  async buyItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'products.product': { $ne: productId } },
        { $push: { products: { product: productId, quantity: quantity } } },
        { new: true },
      )
      .exec()
      .then((user) => {
        if (user) return user;
        return this.userModel
          .findOneAndUpdate(
            { _id: userId, 'products.product': productId },
            { $inc: { 'products.$.quantity': quantity } },
            { new: true },
          )
          .exec();
      });
  }

  async uploadPicture(
    bucketName: string,
    key: string,
    file_in_base64_string: Base64,
  ) {
    const region = process.env.AWS_BUCKET_REGION;
    const accessKey =
      process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
    const secretKey =
      process.env.AWS_SECRET_KEY || process.env.AWS_VERCEL_SECRET_KEY;

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
