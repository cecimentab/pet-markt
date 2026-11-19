import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CartStore } from '../../stores/cart.store';
import { Auth } from '../../auth/auth';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartStore = inject(CartStore);
  previousCount = 0;
  isCartBouncing = signal(false);
  auth = inject(Auth);
  currentUser$ = this.auth.currentUser$;
  isDropdownOpen = signal(false);

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

  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  getUserDisplayName(user: User | null): string {
    if (user) {
      return user?.displayName || user?.email?.split('@')[0] || 'User';
    }
    return '';
  }
  getUserPhotoUrl(user: User | null): string {
    if (user) {
      return (
        user?.photoURL ||
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
      );
    }
    return '';
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.isDropdownOpen.set(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}
