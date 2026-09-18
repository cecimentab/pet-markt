import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { db } from './../../prisma/db';
@Injectable()
export class ProductsService {
  create(createProductInput: CreateProductInput) {
    return 'This action adds a new product';
  }

  async findAll() {
    try {
      const products = await db.orm.public.Product.all();
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new InternalServerErrorException('Unable to fetch products');
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductInput: UpdateProductInput) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
