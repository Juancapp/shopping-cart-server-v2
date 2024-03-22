import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FirstTime } from './user.entity';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop()
  firstTime: FirstTime;

  @Prop({
    type: [
      {
        number: { type: String },
        expiryDate: { type: String },
        cvc: { type: String },
        isDefault: { type: Boolean },
      },
    ],
  })
  paymentMethods: {
    number: string;
    expiryDate: string;
    cvc: string;
    isDefault: boolean;
  }[];

  @Prop({
    type: [
      {
        quantity: { type: Number },
        product: { type: Types.ObjectId, ref: 'Product' },
      },
    ],
  })
  products: { quantity: number; product: Types.ObjectId }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
