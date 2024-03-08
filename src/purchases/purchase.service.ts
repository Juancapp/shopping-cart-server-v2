import { Injectable, Logger, MethodNotAllowedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Purchase } from './purchase.schema';
import { Status } from './purchase.entity';
import { User } from 'src/user/user.schema';
import { Cron } from '@nestjs/schedule';
import moment from 'moment-timezone';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

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
    try {
      const currentDate = moment().tz('America/Montevideo');
      currentDate.subtract(30, 'minutes');

      await this.purchaseSchema.updateMany(
        {
          createdAt: {
            $lt: currentDate.toDate(),
          },
        },
        { $set: { status: Status.SUCCESS } },
      );

      return;
    } catch (error) {
      return error;
    }
  }
}
