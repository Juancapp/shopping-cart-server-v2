import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Headers,
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
    @Headers('cvc')
    cvc: string,
  ): Promise<Purchase> {
    return await this.purchaseService.createPurchase(purchase, cvc);
  }

  @Patch('/:id')
  async editPurchase(
    @Param('id')
    purchaseId,

    @Body()
    purchase,
  ): Promise<Purchase> {
    return await this.purchaseService.editPurchase(purchaseId, purchase);
  }

  @Delete(':id')
  async cancelPurchase(
    @Param('id')
    purchaseId,
  ) {
    return await this.purchaseService.cancelPurchase(purchaseId);
  }
}
