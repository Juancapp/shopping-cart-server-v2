import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
  async getPurchaseByUserId(
    @Param('userId')
    id: string,
  ) {
    return await this.purchaseService.getPurchasesByUserId(id);
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
