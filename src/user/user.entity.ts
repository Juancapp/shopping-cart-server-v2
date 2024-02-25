import { Types } from 'mongoose';
import { Product } from 'src/products/product.schema';

export class User {
  id: string;
  name: string;
  product: Types.ObjectId | Product;
}
