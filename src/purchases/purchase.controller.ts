import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Purchase } from './purchase.schema';

@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Get(':userId')
  async getPurchaseByUserId(
    @Param('userId')
    id: string,
  ) {
    return this.purchaseService.getPurchasesByUserId(id);
  }

  @Post()
  async createPurchase(
    @Body()
    purchase,
  ): Promise<Purchase> {
    return this.purchaseService.createPurchase(purchase);
  }

  @Delete(':id')
  async cancelPurchase(
    @Param('id')
    purchaseId,
  ) {
    return this.purchaseService.cancelPurchase(purchaseId);
  }
}
