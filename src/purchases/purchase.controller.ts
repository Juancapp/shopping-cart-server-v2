import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Purchase } from './purchase.schema';

@Controller('purchases')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Get()
  async getPurchases() {
    return await this.purchaseService.setPurchaseToSuccess();
  }

  @Get(':userId')
  async getPurchasesByUserId(
    @Query() query,

    @Param('userId')
    id: string,
  ) {
    return await this.purchaseService.getPurchasesByUserId(query, id);
  }

  @Post()
  async createPurchase(
    @Body()
    purchase,
  ): Promise<Purchase> {
    return await this.purchaseService.createPurchase(purchase);
  }

  @Delete(':id')
  async cancelPurchase(
    @Param('id')
    purchaseId,
  ) {
    return await this.purchaseService.cancelPurchase(purchaseId);
  }
}
