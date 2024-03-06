import { Types } from 'mongoose';
import { Product } from 'src/products/product.entity';

export enum Status {
  PENDING = 'pending',
  SUCCESS = 'success',
}

export class Purchase {
  user: Types.ObjectId;
  totalPrice: number;
  totalQuantity: number;
  products: { quantity: number; product: Product }[];
  status: Status;
}
