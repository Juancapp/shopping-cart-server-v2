import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Status } from './purchase.entity';
import { Product } from 'src/products/product.schema';

@Schema({
  timestamps: true,
})
export class Purchase {
  @Prop()
  user: Types.ObjectId;

  @Prop()
  totalPrice: number;

  @Prop()
  totalQuantity: number;

  @Prop()
  products: { quantity: number; product: Product }[];

  @Prop()
  status: Status;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  cardNumber: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
