import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { db } from './../../prisma/db';
import { or } from '@prisma/orm-postgres/orm-client';
import { Product } from './entities/product.entity';
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

  async findOne(id: string) {
    try {
      const product = await db.orm.public.Product.where({ id })
        .all()
        .firstOrThrow();
      return product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw new InternalServerErrorException('Unable to fetch product');
    }
  }

  async searchProducts(term: string): Promise<Product[]> {
    const searchTerm = term.trim();
    try {
      const products = await db.orm.public.Product.where((product) =>
        or(
          product.name.ilike(`%${searchTerm}%`),
          product.description.ilike(`%${searchTerm}%`),
        ),
      ).all();
      return products;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new InternalServerErrorException('Unable to search products');
    }
  }

  async update(id: string, updateProductInput: UpdateProductInput) {
    try {
      const product = await db.orm.public.Product.where({ id })
        .all()
        .firstOrThrow();
      if (!product) {
        throw new InternalServerErrorException('Product not found');
      }
      // Perform the update logic here
      return product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new InternalServerErrorException('Unable to update product');
    }
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
