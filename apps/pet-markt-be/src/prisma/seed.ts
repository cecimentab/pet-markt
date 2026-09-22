import { db } from './db';
import { productsList } from './productList';

async function main() {
  console.log('Start seeding...');

  //   Check existing products

  const existingProducts =
    await db.orm.public.Product.select('stripePriceId').all();
  const existingPriceIds = new Set(
    existingProducts.map((p) => p.stripePriceId),
  );

  // console.log(`Existing products: ${existingProducts.length}`);
  // console.log(`Existing price IDs: ${Array.from(existingPriceIds).join(', ')}`);

  for (const product of productsList) {
    const { ...productData } = product;
    if (!existingPriceIds.has(productData.stripePriceId)) {
      await db.orm.public.Product.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        stripePriceId: productData.stripePriceId,
        isFeatured: productData.isFeatured,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`Created product: ${productData.name}`);
    } else {
      console.log(`Skipping existing product: ${productData.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.close();
  });
