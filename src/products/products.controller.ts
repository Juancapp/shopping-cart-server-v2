import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.schema';
import { ProductData } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Get()
  async getAllProducts(@Query() query): Promise<ProductData> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  async findById(
    @Param('id')
    id: string,
  ): Promise<Product> {
    return this.productService.findById(id);
  }

  @Post()
  async createProduct(
    @Body()
    product,
  ): Promise<Product> {
    return this.productService.createProduct(product);
  }

  @Put(':id')
  async editProduct(
    @Param('id')
    id: string,
    @Body()
    product,
  ): Promise<Product> {
    return this.productService.editProduct(id, product);
  }
}
