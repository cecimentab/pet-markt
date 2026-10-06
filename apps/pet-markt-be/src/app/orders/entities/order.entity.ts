import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { OrderStatus } from '../order-status.enum';
import { OrderItem } from './order.item.entity';

@ObjectType()
export class Order {
  @Field(() => ID)
  id!: string;

  @Field(() => [OrderItem], { nullable: true })
  items?: OrderItem[];

  @Field(() => Float)
  totalAmount!: number;

  @Field(() => String)
  status!: OrderStatus;

  @Field(() => String, { nullable: true })
  paymentId?: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}
