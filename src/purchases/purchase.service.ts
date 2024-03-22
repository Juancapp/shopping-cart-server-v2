import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Purchase } from './purchase.schema';
import { Status } from './purchase.entity';
import { User } from 'src/user/user.schema';
import { Cron } from '@nestjs/schedule';
// import { isCardExpired } from '../helpers/api';

@Injectable()
export class PurchaseService {
  @Cron('0 * * * * *')
  handleCron() {
    this.setPurchaseToSuccess();
  }

  constructor(
    @InjectModel(Purchase.name)
    private purchaseSchema: mongoose.Model<Purchase>,

    @InjectModel(User.name)
    private userSchema: mongoose.Model<User>,
  ) {}

  async createPurchase(purchase: Purchase, cvc: string): Promise<Purchase> {
    const foundUser = await this.userSchema.findById(purchase.user);
    const foundDefaultPayment = foundUser.paymentMethods.find(
      (payment) => payment.isDefault,
    );

    if (foundDefaultPayment.cvc !== cvc) {
      throw new BadRequestException('Invalid CVC');
    }

    // if (isCardExpired(foundDefaultPayment.expiryDate)) {
    //   throw new BadRequestException(
    //     'Credit card is expired, look at Payment Methods section',
    //   );
    // }

    if (!foundUser.paymentMethods.length) {
      throw new BadRequestException('User has not payment method');
    }

    const updatedUser = await this.userSchema.findByIdAndUpdate(
      {
        _id: purchase.user,
      },
      { $set: { products: [] } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User was not found');
    }

    const res = await this.purchaseSchema.create(purchase);
    return res;
  }

  async getPurchasesByUserId(
    query = {} as Record<string, never>,
    userId: string,
  ): Promise<{
    nextPage: number;
    totalPages: number;
    purchases: Purchase[];
  }> {
    if (!userId) {
      throw new Error('Not user');
    }

    const resPerPage = 5;
    const currentPage = 'page' in query ? Number(query.page) : 1;
    const skip = resPerPage * (currentPage - 1);

    const res = await this.purchaseSchema
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip);

    const totalProducts = await this.purchaseSchema.countDocuments();

    return {
      nextPage:
        currentPage < totalProducts / resPerPage ? currentPage + 1 : undefined,
      totalPages: Math.ceil(totalProducts / resPerPage),
      purchases: res,
    };
  }

  async cancelPurchase(purchaseId: string) {
    const foundPurchase: Purchase =
      await this.purchaseSchema.findById(purchaseId);

    if (foundPurchase.status === Status.SUCCESS) {
      return new MethodNotAllowedException(
        'You can only delete pending purchases',
      );
    }

    const deletedPurchase =
      await this.purchaseSchema.findByIdAndDelete(purchaseId);

    return deletedPurchase;
  }

  async editPurchase(purchaseId: string, purchase: { status: Status }) {
    const foundPurchase = await this.purchaseSchema.findByIdAndUpdate(
      purchaseId,
      {
        $set: { status: purchase.status },
      },
      { new: true },
    );

    return foundPurchase;
  }

  async setPurchaseToSuccess() {
    const foundPurchases = await this.purchaseSchema.find({
      status: Status.PENDING,
    });

    const promises = [];

    for (let i = 0; i < foundPurchases.length; i++) {
      const difference =
        (new Date().getTime() -
          new Date(foundPurchases[i].createdAt).getTime()) /
        60000;

      if (difference > 30) {
        promises.push(
          await this.purchaseSchema.findOneAndUpdate(
            { _id: foundPurchases[i]._id },
            { $set: { status: Status.SUCCESS } },
          ),
        );
      }
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  }
}
