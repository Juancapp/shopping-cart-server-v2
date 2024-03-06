import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseSchema } from './purchase.schema';
import { PurchaseController } from './purchase.controller';
import { UserSchema } from 'src/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Purchase', schema: PurchaseSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
