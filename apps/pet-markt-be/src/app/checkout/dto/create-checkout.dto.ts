import { InputType, Field, Float } from '@nestjs/graphql';
import { OrderItemInput } from '../../orders/dto/create-order.input';

@InputType()
export class CreateCheckoutDto {
  items!: OrderItemInput[];

  @Field(() => Float)
  totalAmount!: number;
}
