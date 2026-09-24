import { afterNextRender, Component, inject } from '@angular/core';
import { ProductStore } from '../stores/product.store';
import {ProductCard} from '../components/product-card/product-card';

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  productStore = inject(ProductStore);

  constructor() {
    afterNextRender(() => {
      this.productStore.loadProducts();
    });
  }
}
