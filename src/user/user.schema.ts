import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

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
