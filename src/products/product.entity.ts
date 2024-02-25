import { Product as SchemaProduct } from './product.schema';

export class Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rate: {
    rate: number;
    count: number;
  };
  image: string;
}

export interface ProductData {
  page: number;
  totalPages: number;
  products: SchemaProduct[];
}
