import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../stores/cart.store';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartStore = inject(CartStore);

  updateQuantity(productId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value);
    if (quantity > 0) {
      this.cartStore.updateQuantity(productId, quantity);
    }
  }
}
