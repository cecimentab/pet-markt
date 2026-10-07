import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  exampleField!: string;
}
