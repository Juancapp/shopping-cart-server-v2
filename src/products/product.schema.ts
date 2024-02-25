import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Category {
  ELECTRONICS = 'electronics',
  MENS_CLOTHING = `men's clothing`,
  WOMENS_CLOTHING = `women's clothing`,
  JEWELERY = 'jewelery',
}

@Schema({
  timestamps: true,
})
export class Product {
  @Prop()
  productId: number;

  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  category: Category;

  @Prop()
  image: string;

  @Prop({ type: { rate: Number, count: Number } })
  rating: Record<string, number>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
