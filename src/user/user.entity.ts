import { Types } from 'mongoose';
import { Product } from 'src/products/product.schema';

export enum FirstTime {
  TRUE = 'true',
  FALSE = 'false',
}

export type PaymentMethod = {
  number: string;
  expiryDate: string;
  cvc: string;
  isDefault: boolean;
};
export class User {
  id: string;
  name: string;
  product: Types.ObjectId | Product;
  firstTime: FirstTime;
  paymentMethods: PaymentMethod[];
}
