import { Component, inject } from '@angular/core';
import { CartStore } from '../stores/cart.store';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  cartStore = inject(CartStore);

  checkout() {
    return 0;
  }
}
