import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Product } from './product.schema';
import { ProductData } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: mongoose.Model<Product>,
  ) {}

  async findAll(query = {} as Record<string, never>): Promise<ProductData> {
    const order = {
      ['desc']: -1,
      ['asc']: 1,
    };

    const resPerPage = 8;
    const currentPage = 'page' in query ? Number(query.page) : 1;
    const skip = resPerPage * (currentPage - 1);

    const sortQuery = {};
    const findQuery =
      'title' in query
        ? {
            ...query,
            title: {
              $regex: query.title,
              $options: 'i',
            },
          }
        : { ...query };

    if ('orderBy' in findQuery) {
      sortQuery[findQuery.orderBy] = order[findQuery.order];
      delete findQuery.orderBy;
      delete findQuery.order;
    }

    if ('page' in findQuery) {
      delete findQuery.page;
    }

    const products = await this.productModel
      .find(findQuery)
      .limit(resPerPage)
      .sort(sortQuery)
      .skip(skip);

    if (!products.length) throw new NotFoundException('There are not products');

    const totalProducts = await this.productModel.countDocuments(findQuery);

    const data = {
      page: currentPage,
      products: products,
      totalPages: Math.ceil(totalProducts / resPerPage),
    };

    return data;
  }

  async createProduct(product: Product): Promise<Product> {
    const res = await this.productModel.create(product);
    return res;
  }

  async editProduct(id: string, product: Product): Promise<Product> {
    const res = await this.productModel.findByIdAndUpdate(id, product, {
      new: true,
      runValidators: true,
    });

    return res;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }
}
