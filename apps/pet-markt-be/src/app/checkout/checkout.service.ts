import { Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CheckoutService {
  constructor(private ordersService: OrdersService) {}
  async create(createCheckoutDto: CreateCheckoutDto) {
    const order = await this.ordersService.create({
      items: createCheckoutDto.items,
      totalAmount: createCheckoutDto.totalAmount,
    });
    return order;
  }
}
