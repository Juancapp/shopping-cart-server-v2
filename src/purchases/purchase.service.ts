import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Purchase } from './purchase.schema';
import { Status } from './purchase.entity';
import { User } from 'src/user/user.schema';

@Injectable()
export class PurchaseService {
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

    setTimeout(
      async () => {
        if (res) {
          await this.purchaseSchema.findByIdAndUpdate(
            { _id: res._id },
            { $set: { status: Status.SUCCESS } },
            { new: true },
          );
        }
      },
      1000 * 60 * 30,
    );

    return res;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    const res = this.purchaseSchema.find({ user: userId });
    return res;
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
}
