import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Purchase } from './purchase.schema';
import { Status } from './purchase.entity';
import { User } from 'src/user/user.schema';
import { Cron } from '@nestjs/schedule';

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

  async createPurchase(purchase: Purchase): Promise<Purchase> {
    const res = await this.purchaseSchema.create(purchase);

    await this.userSchema.findByIdAndUpdate(
      {
        _id: res?.user,
      },
      { $set: { products: [] } },
      { new: true },
    );

    return res;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    const res = await this.purchaseSchema.find({ user: userId });

    return res.sort((a: Purchase, b: Purchase) =>
      a.status.localeCompare(b.status),
    );
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

    return;
  }
}
