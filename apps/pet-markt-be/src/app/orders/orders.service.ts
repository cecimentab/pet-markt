import { Injectable } from '@nestjs/common';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderStatus } from './order-status.enum';
import { db } from '../../prisma/db';

@Injectable()
export class OrdersService {
  async create(createOrderInput: CreateOrderInput) {
    const { totalAmount, items } = createOrderInput;

    return db.orm.public.Order.include('items', (orderItem) =>
      orderItem.include('product'),
    ).create({
      totalAmount,
      status: OrderStatus.PENDING,
      items: (relation) =>
        relation.create(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        ),
    });
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: string) {
    return db.orm.public.Order.include('items', (orderItem) =>
      orderItem.include('product'),
    )
      .where({ id })
      .first();
  }

  update(id: number, updateOrderInput: UpdateOrderInput) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
