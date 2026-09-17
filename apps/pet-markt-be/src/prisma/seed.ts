import { db } from './db';
// import { db } from "./prisma/db";
import { productsList } from './productList';

// async function main() {
//   console.log('Start seeding...');

  // Check existing products


    // const existingProducts = await db.orm.public.Product
    //     .select("stripePriceId")
    //     .all();
    // const existingPriceIds = new Set(
    //     existingProducts.map((p) => p.stripePriceId)
    // );

for (const productData of productsList) {
  await db.orm.public.Product.create({
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image: productData.image,
    stripePriceId: productData.stripePriceId,
    isFeatured: productData.isFeatured,
  }); 
   console.log(`Created product: ${productData.name}`);
}
// await db.close();

//   Create only products that don't exist
//   for (const product of productsList) {
//     const { ...productData } = product;
//     if (!existingPriceIds.has(productData.stripePricedId)) {
//       await db.orm.public.Product.create({
//         data: {
//           name: productData.name,
//           description: productData.description,
//           price: productData.price,
//           image: productData.image,
//           stripePriceId: productData.stripePriceId,
//           isFeatured: productData.isFeatured,
//           createdAt: productData.createdAt,
//           updatedAt: productData.updatedAt,

//         },
//       });
//       console.log(`Created product: ${productData.name}`);
//     } else {
//       console.log(`Skipping existing product: ${productData.name}`);
//     }
//   }

//   console.log('Seeding finished.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//      db.close()
//   });
