import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../stores/cart.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartStore = inject(CartStore);
  previousCount = 0;
  isCartBouncing = signal(false);

  constructor() {
    effect(() => {
      const currentCount = this.cartStore.totalItems();

      if (currentCount && currentCount > this.previousCount) {
        this.isCartBouncing.set(true);

        setTimeout(() => {
          this.isCartBouncing.set(false);
        }, 1000);
      }
      this.previousCount = currentCount;
    });
  }
}
