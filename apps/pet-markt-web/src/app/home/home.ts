import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductStore } from '../stores/product.store';
import { CartStore } from '../stores/cart.store';
import { Product } from '../interfaces/product';
import { ProductCard } from '../components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  productStore = inject(ProductStore);
  cartStore = inject(CartStore);

  constructor() {
    this.productStore.getFeaturedProducts(true);
  }

  onAddToCart(product: Product) {
    this.cartStore.addToCart(product);
  }
}
